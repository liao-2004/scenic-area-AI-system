<template>
	<view class="login">
		<view class="logo">
			<image src="../../static/images/user-h.png" mode="widthFix"></image>
			<view class="appname">青年帮新闻</view>
		</view>

		<view class="tip">登录后可同步浏览记录与个人信息</view>

		<button class="loginbtn" type="primary" :loading="logining" @click="handleLogin">
			微信一键登录
		</button>

		<view class="agreement">
			登录即代表同意《用户协议》与《隐私政策》
		</view>
	</view>
</template>

<script>
	import { wechatLogin } from '@/utils/request.js'
	import { startLocationReport } from '@/utils/location.js'

	export default {
		data() {
			return {
				logining: false
			}
		},
		methods: {
			async handleLogin() {
				if (this.logining) return
				this.logining = true
				try {
					// 前端调用 uni.login() 取 code -> 后端换 openid 并签发 token
					const res = await wechatLogin()
					// 登录成功后开始每分钟上报坐标
					startLocationReport()
					uni.showToast({
						title: res.isNewUser ? '注册成功' : '登录成功',
						icon: 'success'
					})
					// 登录成功后回到首页（或返回上一页）
					setTimeout(() => {
						const pages = getCurrentPages()
						if (pages.length > 1) {
							uni.navigateBack()
						} else {
							uni.switchTab({ url: '/pages/index/index' })
						}
					}, 800)
				} catch (e) {
					console.error('登录失败', e)
					uni.showToast({
						title: (e && e.message) || '登录失败，请重试',
						icon: 'none'
					})
				} finally {
					this.logining = false
				}
			}
		}
	}
</script>

<style lang="scss">
.login {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 160rpx;

	.logo {
		display: flex;
		flex-direction: column;
		align-items: center;
		image {
			width: 160rpx;
			height: 160rpx;
		}
		.appname {
			font-size: 40rpx;
			color: #333;
			padding-top: 20rpx;
			font-weight: bold;
		}
	}

	.tip {
		font-size: 28rpx;
		color: #888;
		margin: 80rpx 0 60rpx;
	}

	.loginbtn {
		width: 560rpx;
		background: #31C27C;
		border-radius: 50rpx;
	}

	.agreement {
		position: fixed;
		bottom: 60rpx;
		font-size: 24rpx;
		color: #aaa;
	}
}
</style>
