const db = require('../connection/_index');

const TAIPEI_TZ_OFFSET = 8 * 60; // 台北 +08:00 分鐘數

function padZero(n) {
  return n < 10 ? '0' + n : n;
}

function formatDateStr(date) {
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
}

// YYYY-MM-DD HH:00:00 格式 (UTC時間)
function formatDateTimeStr(date) {
  return `${formatDateStr(date)} ${padZero(date.getHours())}:00:00`;
}

// YYYY-MM-DD HH:00 - HH:59 格式 (用於印出)
function formatSummaryRange(date) {
  const start = padZero(date.getHours()) + ':00';
  const end = padZero(date.getHours()) + ':59';
  return `${start} - ${end}`;
}

function toUtc(date) {
  return new Date(date.getTime() - TAIPEI_TZ_OFFSET * 60000);
}

// 取得台北時區的日期物件（修正時區差）
function getTaipeiDate(date) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + TAIPEI_TZ_OFFSET * 60000);
}

function doSummary() {
  console.log('⏱ 檢查資料庫上次統計時間...');

  db.query(
    `SELECT visit_date, hour FROM visit_summary ORDER BY visit_date DESC, hour DESC LIMIT 1`,
    (err, rows) => {
      if (err) return console.error('❌ 查詢最後統計時間失敗:', err);

      let current = new Date();
      current.setMinutes(0, 0, 0); // 整點
      const nowTaipei = getTaipeiDate(current);
      nowTaipei.setHours(nowTaipei.getHours() - 1); // 統計只到前一小時（理論最新時間）

      if (rows.length === 0) {
        // 無紀錄，從 visits 最早時間開始
        db.query(`SELECT MIN(created_at) AS min_time FROM visits`, (err2, rows2) => {
          if (err2) return console.error('❌ 查詢 visits 最早資料失敗:', err2);
          if (!rows2[0].min_time) return console.log('⚠ 沒有任何 visits 資料');

          let startUTC = new Date(rows2[0].min_time);
          startUTC.setMinutes(0, 0, 0);

          console.log('🧪 無統計紀錄，從最早 visits 時間開始:', formatDateTimeStr(startUTC));
          processHourlySummary(startUTC, nowTaipei);
        });
      } else {
        const { visit_date, hour } = rows[0];
        if (!visit_date || hour === null || hour === undefined) {
          return console.error('❌ 無效的 visit_summary 資料:', rows[0]);
        }

        const visitDateStr = formatDateStr(new Date(visit_date));
        const lastSummaryTaipei = new Date(`${visitDateStr}T${padZero(hour)}:00:00+08:00`);

        if (isNaN(lastSummaryTaipei.getTime())) {
          return console.error('❌ 時間轉換失敗:', lastSummaryTaipei);
        }

        console.log('🧪 最後統計時間 (台北時區):', formatSummaryRange(lastSummaryTaipei));
        console.log('🧪 理論最新時間 (台北時區):', formatSummaryRange(nowTaipei));

        if (lastSummaryTaipei >= nowTaipei) {
          console.log('✅ 統計已是最新，不需補齊');
          cleanupOldData();
          return;
        }

        const nextStartUTC = new Date(lastSummaryTaipei.getTime() + 60 * 60 * 1000);

        console.log('🧪 將從 UTC', formatDateTimeStr(nextStartUTC), '開始補齊');
        processHourlySummary(nextStartUTC, nowTaipei);
      }
    }
  );
}

function processHourlySummary(startTimeUTC, endTaipei) {
  if (!(startTimeUTC instanceof Date) || isNaN(startTimeUTC)) {
    console.error('❌ startTime 無效:', startTimeUTC);
    return;
  }

  // 台北時間
  const startTaipei = getTaipeiDate(startTimeUTC);

  if (startTaipei > endTaipei) {
    console.log('✅ 數據統計完成，資料皆已補齊\n');
    cleanupOldData();
    return;
  }

  const rangeStr = formatSummaryRange(startTaipei);

  // 轉換成 UTC 時間區間，用於查 users.lastLogin_time
  const startUtcDate = toUtc(startTaipei);
  const endUtcDate = new Date(startUtcDate.getTime() + 60 * 60 * 1000);

  const startUtcStr = formatDateTimeStr(startUtcDate);
  const endUtcStr = formatDateTimeStr(endUtcDate);

  // visits 用台北時間條件（created_at +8 小時）
  const startTaipeiStr = formatDateTimeStr(startTaipei);
  const endTaipeiPlus1Hour = new Date(startTaipei.getTime() + 60 * 60 * 1000);
  const endTaipeiStr = formatDateTimeStr(endTaipeiPlus1Hour);

  console.log(`📊 正在統計 ${rangeStr} 的資料`);
  console.log(`    查 users lastLogin_time 用 UTC 範圍：${startUtcStr} ~ ${endUtcStr}`);
  console.log(`    查 visits.created_at 用台北時間範圍：${startTaipeiStr} ~ ${endTaipeiStr}`);

  const sql = `
  INSERT INTO visit_summary (visit_date, hour, visit_count, active_user_count)
  SELECT
    DATE(DATE_ADD(created_at, INTERVAL 8 HOUR)) AS visit_date,
    HOUR(DATE_ADD(created_at, INTERVAL 8 HOUR)) AS hour,
    COUNT(*) AS visit_count,
    (
      SELECT COUNT(DISTINCT user_id)
      FROM users
      WHERE lastLogin_time >= ? AND lastLogin_time < ?
    ) AS active_user_count
  FROM visits
  WHERE DATE_ADD(created_at, INTERVAL 8 HOUR) >= ? AND DATE_ADD(created_at, INTERVAL 8 HOUR) < ?
  GROUP BY DATE(DATE_ADD(created_at, INTERVAL 8 HOUR)), HOUR(DATE_ADD(created_at, INTERVAL 8 HOUR))
  ON DUPLICATE KEY UPDATE
    visit_count = VALUES(visit_count),
    active_user_count = VALUES(active_user_count)
  `;

  // 帶入參數：users 用 UTC 範圍，visits 用台北時間範圍
  const params = [startUtcStr, endUtcStr, startTaipeiStr, endTaipeiStr];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(`❌ 統計 ${rangeStr} 資料出錯:`, err);
      return;
    }

    if ((result.affectedRows || 0) === 0) {
      // 沒有 visits，補上 visit_count = 0，但仍要查 active_user_count
      db.query(
        `
        SELECT COUNT(DISTINCT user_id) AS active_user_count
        FROM users
        WHERE lastLogin_time >= ? AND lastLogin_time < ?
        `,
        [startUtcStr, endUtcStr],
        (err2, rows) => {
          if (err2) {
            console.error(`❌ 補空時段 active_user_count 查詢錯誤:`, err2);
            return;
          }

          const activeUserCount = rows[0]?.active_user_count || 0;

          db.query(
            `
            INSERT INTO visit_summary (visit_date, hour, visit_count, active_user_count)
            VALUES (?, ?, 0, ?)
            ON DUPLICATE KEY UPDATE
              visit_count = VALUES(visit_count),
              active_user_count = VALUES(active_user_count)
            `,
            [formatDateStr(startTaipei), startTaipei.getHours(), activeUserCount],
            (err3, result2) => {
              if (err3) {
                console.error(`❌ 補空時段 insert 出錯:`, err3);
                return;
              }

              console.log(`🈳 補空時段 ${rangeStr} 完成，active_user_count=${activeUserCount}`);
              const nextStartUTC = new Date(startTimeUTC.getTime() + 60 * 60 * 1000);
              processHourlySummary(nextStartUTC, endTaipei);
            }
          );
        }
      );
    } else {
      console.log(`▶️ 統計 ${rangeStr} 完成，新增/更新列數: ${result.affectedRows || 0}`);
      const nextStartUTC = new Date(startTimeUTC.getTime() + 60 * 60 * 1000);
      processHourlySummary(nextStartUTC, endTaipei);
    }
  });
}



function cleanupOldData() {
  const now = new Date();
  now.setDate(now.getDate() - 29);
  const oldDateStr = formatDateStr(now);

  db.query(`DELETE FROM visit_summary WHERE visit_date < ?`, [oldDateStr], (err) => {
    if (err) return console.error('❌ 刪除舊資料失敗:', err);
    // console.log('🧹 舊資料清理完成');
  });
}

function runHourlyJob() {
  const now = new Date();
  if (now.getMinutes() === 1) {
    doSummary();
  }
}

// 啟動先跑一次
doSummary();

// 每分鐘檢查一次是否該跑統計
setInterval(runHourlyJob, 60 * 1000);

console.log('⏰ 每小時統計任務啟動中...');
