<template>
	<div class="container d-flex justify-content-center align-items-center vh-100">
		<div class="card p-4 shadow" style="max-width: 400px; width: 100%;">
			<h3 class="text-center mb-4">棲遲書屋後台登入</h3>
			<form @submit.prevent="login" autocomplete="off">
				<div class="mb-3">
					<label for="username" class="form-label">管理者帳號</label>
					<input type="text" id="username" v-model="username" class="form-control" autocomplete="off"
						required />
				</div>
				<div class="mb-3">
					<label for="password" class="form-label">管理者密碼</label>
					<input type="password" id="password" v-model="password" class="form-control"
						autocomplete="new-password" required />
				</div>
				<button type="submit" class="btn btn-primary w-100">登入</button>
			</form>
			<div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
		</div>
	</div>
</template>

<script>
import api from '@/api.js';

export default {
	name: 'AdminLoginView',
	data() {
		return {
			username: '',
			password: '',
			error: ''
		};
	},
	methods: {
		login() {
			api.post('/api/admin/login', {
				username: this.username,
				password: this.password
			})
				.then(res => {
					localStorage.setItem('token', res.data.token);
					localStorage.setItem('isAdmin', 'true');
					this.$router.push('/admin/home');
				})
				.catch(err => {
					if (err.response && err.response.status === 403) {
						this.error = '帳號或密碼錯誤';
					} else {
						this.error = '登入失敗，請稍後再試';
					}
				});

		}
	}
};
</script>
