<template>
	<div class="selectContent" id="settings">
		<!-- 🌈 個人化設定 -->
		<section class="mb-4">
			<h5>個人化設定</h5>
			<div class="soild"></div>
			<div class="inp_modle mt-2">
				<label class="form-label">主題風格</label>
				<select id="themeSelector" class="form-select">
					<option value="default" selected>經典金虹</option>
					<option value="ocean">海青嵐（測試主題）</option>
					<option value="dark">墨韻黑（測試主題）</option>
				</select>
			</div>
		</section>

		<!-- 個人資料管理 -->
		<section id="infoSection" class="mb-4 edit-section">
			<h5>個人資料管理</h5>
			<div class="soild"></div>

			<div class="inp_modle">
				<label>暱稱</label>
				<input type="text" v-model="user.nickname" class="edit-input" v-show="isEditingInfo" />
				<p class="display-text" v-show="!isEditingInfo">{{ user.nickname }}</p>
			</div>

			<div class="inp_modle">
				<label class="form-label">性別</label>
				<select v-model="user.gender" class="edit-input form-select" v-show="isEditingInfo">
					<option>男性</option>
					<option>女性</option>
					<option>隱藏</option>
				</select>
				<p class="display-text" v-show="!isEditingInfo">{{ user.gender }}</p>
			</div>

			<div class="inp_modle">
				<label class="form-label">生日</label>
				<input type="date" v-model="formattedBirth" class="edit-input" v-show="isEditingInfo" />
				<p class="display-text" v-show="!isEditingInfo">{{ formattedBirth }}</p>
			</div>

			<div class="inp_modle">
				<label class="form-label">個人簡介</label>
				<textarea v-model="user.summary" class="edit-input" style="resize: none"
					:placeholder="message.plahold.summary" v-show="isEditingInfo"></textarea>
				<p class="display-text text-truncate" v-show="!isEditingInfo">{{ userSummary }}</p>
			</div>

			<button class="btn btn-sm" :class="isEditingInfo ? 'btn-primary' : 'btn-outline-primary'"
				@click="toggleInfoEdit">
				{{ isEditingInfo ? '完成修改' : '修改個人資訊' }}
			</button>
			<div v-show="isEditingInfo" class="overlay"></div>
		</section>

		<!-- 聯繫方式 -->
		<section id="contactSection" class="mb-4 edit-section">
			<h5 class="mb-3">聯繫方式</h5>
			<div class="soild"></div>

			<div class="inp_modle towline">
				<div class="label-badge">
					<label>電子信箱</label>
					<!-- <span class="badge bg-success">已驗證</span> -->
					<span v-if="user.isEmailVerified" class="badge bg-success">已驗證</span>
					<span v-else class="badge bg-warning text-dark">未驗證</span>
				</div>
				<div class="d-flex align-items-center w-100">
					<input type="email" v-model="user.email" class="edit-input" v-show="isEditingContact" />
					<p class="display-text" v-show="!isEditingContact">{{ user.email }}</p>
					<!-- <p class="display-text">{{ user.email }}</p> -->
					<button v-if="!isEditingContact && !user.isEmailVerified"
						class="display-text btn btn-sm btn-outline-success ms-2" :disabled="isSending || countdown > 0"
						@click="sendVerificationEmail">

						<!-- 寄送中 -->
						<span v-if="isSending">
							<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
							寄送中...
						</span>

						<!-- 倒數中 -->
						<span v-else-if="countdown > 0">
							稍待 {{ countdown }} 秒
						</span>

						<!-- 預設 -->
						<span v-else>
							寄送驗證信
						</span>
					</button>
				</div>
			</div>

			<div class="inp_modle towline">
				<div class="label-badge">
					<label>手機號碼</label>
					<span class="badge bg-success">已驗證</span>
				</div>
				<div class="d-flex align-items-center w-100">
					<input type="text" v-model="user.phone" class="edit-input" v-show="isEditingContact" />
					<p class="display-text" v-show="!isEditingContact">{{ user.phone }}</p>
				</div>
			</div>

			<div class="inp_modle towline">
				<div class="label-badge">
					<label>通訊地址</label>
				</div>
				<div class="d-flex flex-column align-items-center w-100">
					<div class="old row w-100">
						<input type="text" v-model="user.address" class="edit-input"
							:placeholder="message.plahold.address" v-show="isEditingContact" />
						<p class="display-text" v-show="!isEditingContact">{{ userAddress }}</p>
					</div>
				</div>
			</div>

			<button class="btn btn-sm" :class="isEditingContact ? 'btn-primary' : 'btn-outline-primary'"
				@click="toggleContactEdit">
				{{ isEditingContact ? '完成修改' : '修改聯繫方式' }}
			</button>
			<div v-show="isEditingContact" class="overlay"></div>
		</section>

		<!-- 🔐 隱私與安全性 -->
		<section class="mb-4">
			<h5>隱私與安全性</h5>
			<div class="soild"></div>

			<div id="accountSection" class="inp_modle towline edit-section">
				<label class="form-label">帳號</label>
				<div class="d-flex align-items-center w-100">
					<input type="email" value="myusername" class="edit-input" style="display:none;">
					<p class="display-text">myusername</p>
					<!-- <button id="toggleAccountEditBtn" class="btn btn-sm btn-outline-primary ms-2">修改帳號</button> -->
				</div>
			</div>

			<div id="passwordSection" class="inp_modle towline edit-section">
				<label class="form-label">密碼</label>
				<div class="d-flex align-items-center w-100">
					<input type="email" value="a***************a" class="edit-input" style="display:none;">
					<p class="display-text">a***************a</p>
					<button id="togglePasswordEditBtn" class="btn btn-sm btn-outline-primary ms-2">修改密碼</button>
				</div>
			</div>

			<div class="d-flex justify-content-end mt-5">
				<button class="btn btn-outline-dark w-100" @click="logout">帳號登出</button>
				<!-- <button class="btn btn-danger">刪除帳號</button> -->
			</div>
		</section>
	</div>
</template>

<script>
import dayjs from "dayjs";

export default {
	name: "SettingsArea",
	data() {
		return {
			user: {
				nickname: "",
				gender: "",
				birth: "",
				email: "",
				phone: "",
				summary: "",
				address: "",
			},
			message: {
				plahold: {
					summary: "未設定個人簡介",
					address: "未設定通訊地址",
				},
			},
			// 編輯狀態
			isEditingInfo: false,
			isEditingContact: false,

			// 寄信相關
			isSending: false,
			countdown: 0,				// 目前還要倒數幾秒
			countdownTimer: null,
		};
	},
	computed: {
		formattedBirth: {
			get() {
				return this.user && this.user.birth
					? dayjs(this.user.birth).format("YYYY-MM-DD")
					: "";
			},
			set(value) {
				// 直接存純字串，避免時區問題
				this.user.birth = value; // value 已經是 YYYY-MM-DD 字串
			},
		},
		userSummary() {
			if (!this.user || !this.user.summary) {
				return this.message.plahold.summary;
			}
			return this.user.summary.trim() === ""
				? this.message.plahold.summary
				: this.user.summary;
		},
		userAddress() {
			if (!this.user || !this.user.address) {
				return this.message.plahold.address;
			}
			return this.user.address.trim() === "" ? this.message.plahold.address : this.user.address;
		},
	},
	methods: {
		// 切換「個人資訊」的編輯狀態
		async toggleInfoEdit() {
			if (this.isEditingInfo) {
				const user_id = localStorage.getItem('user_id');

				const payload = {
					nickname: this.user.nickname,
					gender: this.user.gender,
					birth: this.formattedBirth,
					summary: this.user.summary
				};

				console.log("送出的資料內容：", payload); // ✅ 看看是否有空值、undefined、null 等

				try {
					await this.$axios.put(`/api/memberSetting/${user_id}/info`, payload);
					alert('個人資訊已更新');
				} catch (error) {
					console.error('更新個人資訊失敗', error);
					console.log('錯誤回應：', error.response?.data); // ✅ 抓後端訊息
					alert('更新失敗');
				}
			}

			this.isEditingInfo = !this.isEditingInfo;
		},

		// 切換「聯絡方式」的編輯狀態
		async toggleContactEdit() {
			if (this.isEditingContact) {
				// 按下「完成修改」時執行更新
				try {
					const user_id = localStorage.getItem('user_id');
					await this.$axios.put(`/api/memberSetting/${user_id}/contact`, {
						email: this.user.email,
						phone: this.user.phone,
						address: this.user.address
					});
					alert('聯絡方式已更新');
				} catch (error) {
					console.error('更新聯絡方式失敗', error);
					alert('更新失敗');
				}
			}
			this.isEditingContact = !this.isEditingContact;
		},

		// 登出按鈕
		logout() {
			if (confirm('確定要登出嗎？')) {
				localStorage.removeItem('token')      // 清除 token
				localStorage.removeItem('user_id')      // 清除 user_id
				window.dispatchEvent(new Event('login-status-changed'));	// 全局監聽Header頭像
				
				this.$router.push('/login')           // 導向登入頁（路由請依你實際命名）
			}
		},

		// 寄驗證信
		async sendVerificationEmail() {
			if (this.isSending) return; // 如果已經在寄，就不重複動作

			this.isSending = true;

			try {
				const toEmail = this.user.email;

				await this.$axios.post(`/api/email-verification/send`, {
					toEmail,
				});

				alert('我們已發送驗證信至您的信箱🎉\n請在 5 分鐘內點擊信中的連結完成驗證。\n如未收到，請檢查垃圾郵件匣。');

				// 啟動倒數 60 秒
				this.startCountdown(60);
			} catch (error) {
				console.error('寄送驗證信失敗', error);
				alert('寄送驗證信失敗，請稍後再試');
			} finally {
				this.isSending = false; // 無論成功失敗都還原狀態
			}
		},

		// 驗證信冷卻倒數
		startCountdown(seconds) {		// 輸入秒數
			this.countdown = seconds;

			this.countdownTimer = setInterval(() => {
				if (this.countdown > 0) {
					this.countdown--;
				} else {
					clearInterval(this.countdownTimer);
					this.countdownTimer = null;
				}
			}, 1000);		// 每秒 -1
		},


		async fetchUserData() {
			const user_id = localStorage.getItem("user_id");

			if (!user_id) {
				console.log("尚未登入，user_id 為 null，略過資料請求。");
				return;
			}

			try {
				const res = await this.$axios.get(`/api/memberSetting/${user_id}`);
				this.user = res.data.data || {};
				// console.log("會員資料：", res.data.data);
			} catch (err) {
				console.error("取得會員資料失敗", err);
				// alert("資料載入錯誤");
			}
		},
	},
	mounted() {
		this.fetchUserData();
	},
};
</script>



<style scoped>
/* ========================================
   基本全局樣式（適用於所有設備）
   寫好的CSS貼在這區
======================================== */
/* 遮罩 */
.overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.3);
	z-index: 1000;
}

#settings {



	/* 留出左右空白 */
	section {
		padding: 0 30px;
	}

	/* 小區標題 */
	h5 {
		margin: 0;
		font-size: 28px;
		font-family: "標楷體";
		color: var(--main-color);
	}

	.soild {
		margin: 10px 0;
		height: 2px;
		background-color: var(--main-color);
	}

	/* 各項資料顯示修改區 */
	.inp_modle {
		display: flex;
		align-items: center;
		margin-bottom: 10px;

		/* 左邊名稱 */
		label {
			/* 不允許縮小 */
			flex-shrink: 0;
			margin: 0;
			width: 118px;
			height: 40px;
			font-size: 22px;
			font-family: "標楷體";
			color: var(--second-color);
			line-height: 40px;
		}

		/* 右邊內容 */
		p {
			height: 40px;
			font-size: 22px;
			font-family: initial;
			color: var(--second-text-color);
			line-height: 40px;
		}

		/* 輸入框高度 */
		input,
		select {
			height: 40px;
		}

		/* 個人簡介 */
		textarea {
			align-items: start;
			height: 100px;
		}

		/* 細調下拉式文字位置 */
		select {
			padding-left: 5px;
		}

	}

	/* 各項資料顯示修改區－兩行式 */
	.inp_modle.towline {
		flex-direction: column;
		align-items: flex-start;

		/* 上方文字行 */
		.label-badge {
			display: flex;
			align-items: center;
		}

		input,
		p {
			width: 100%;
		}

		button {
			width: 120px;
		}
	}

	/* 清除 .form-select 的圓角和 focus 樣式 */
	.form-select {
		border-radius: 0;

		&:focus {
			/* 邊框顏色 */
			border-color: var(--quote-text-color);
			/* 去掉點選時的藍色光暈改成內陰影 */
			box-shadow: inset -2px -2px 4px var(--second-back-color-transluc);
		}
	}

	/* 編輯區塊 */
	.edit-section {
		z-index: 100;
		padding-top: 10px;
		padding-bottom: 20px;
	}

	/* 編輯區塊－編輯時白色高亮 */
	.edit-section.editing {
		position: relative;
		z-index: 999;

		background-color: var(--back-color-white);
		box-shadow: 0 0 15px var(--second-back-color-transluc);

		font-family: none;
	}

	/* 帳號密碼 */
	#accountSection.edit-section,
	#passwordSection.edit-section {
		margin-bottom: -20px;
	}

	/* 帳號密碼編輯狀態增加左右白色區域 */
	#accountSection.edit-section.editing,
	#passwordSection.edit-section.editing {
		&::before {
			content: "";
			position: absolute;
			top: 0;
			bottom: 0;
			left: -40px;
			right: -40px;
			background-color: var(--back-color-white);
			box-shadow: 0 0 15px var(--second-back-color-transluc);
			z-index: -1;
		}
	}

	/* 地址排版設定－上方原始 */
	.old {
		input {
			/* background-color: lightgray; */
		}

		p {
			padding: 0;
		}
	}

	/* 地址排版設定－分離式輸入 */
	#address {
		input {
			border-radius: 0;
		}

		/* 郵遞區號 */
		#zip {}

		/* 縣市 */
		#county {}

		/* 區/鄉/鎮 */
		#district {}

		/* 街路 */
		#street {}

		/* 巷弄 */
		#lane {}

		/* 門牌號碼 */
		#number {}
	}

}
</style>