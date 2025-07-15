// backend/src/connection/_index.js

require('dotenv').config();

let db;

// 根據 .env 的 DB_TYPE 選擇資料庫連線
const dbProvider = process.env.DB_TYPE;

switch (dbProvider) {
  case 'azure':
    db = require('./azureConnection');
    break;
  case 'alwaysdata':
    db = require('./alwaysdataConnection');
    break;
  default:
    console.error(`❌ 錯誤：無效的 DB_TYPE 設定（目前為 "${dbProvider}"）。請在 .env 中設為 "azure" 或 "alwaysdata"。`);
    process.exit(1);
}

setTimeout(() => {
  console.log(`【目前選用資料庫】 ${dbProvider}\n`);
}, 2000);

module.exports = db;
