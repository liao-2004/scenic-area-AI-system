<template>
	<view class="map-page">
		<map
			class="map"
			:style="{ width: '100%', height: mapHeight + 'px' }"
			:latitude="center.latitude"
			:longitude="center.longitude"
			:scale="scale"
			:markers="markers"
		></map>

		<view class="legend">
			<view class="item"><view class="dot blue"></view>我的位置</view>
			<view class="item"><view class="dot red"></view>其他用户</view>
			<view class="count">在线 {{ markers.length }} 人</view>
		</view>

		<!-- 实时地图下方：紧急救援按钮 -->
		<view class="sos-bar">
			<button class="sos-btn" :loading="sosLoading" :disabled="sosLoading" @click="confirmSos">
				紧急救援
			</button>
		</view>
	</view>
</template>

<script>
	import { request, getToken, getUserInfo, setUserInfo } from '@/utils/request.js'

	const REFRESH = 30 * 1000 // 每 30 秒刷新一次地图坐标
	const SOS_BAR_RPX = 140    // 底部救援按钮栏高度（rpx）

	export default {
		data() {
			return {
				center: { latitude: 27.8483, longitude: 112.9276 }, // 默认中心
				scale: 16,
				markers: [],
				timer: null,
				mapHeight: 600, // 动态计算为屏幕可用高度，避免 100vh 在小程序里塌陷
				myNo: '',       // 当前用户编号（来自 /api/locations 的 mine）
				myLoc: null,    // 当前用户坐标 { latitude, longitude }
				sosLoading: false
			}
		},
		onLoad() {
			// 用系统窗口高度撑满地图，并为底部救援按钮栏留出空间
			try {
				const info = uni.getSystemInfoSync()
				this.mapHeight = info.windowHeight - uni.upx2px(SOS_BAR_RPX)
			} catch (e) {}
		},
		onShow() {
			if (!getToken()) {
				uni.showModal({
					title: '提示',
					content: '请先登录后查看实时地图',
					showCancel: false,
					success: () => uni.navigateTo({ url: '/pages/login/login' })
				})
				return
			}
			this.loadLocations()
			this.timer = setInterval(this.loadLocations, REFRESH)
		},
		onHide() {
			this.clearTimer()
		},
		onUnload() {
			this.clearTimer()
		},
		methods: {
			clearTimer() {
				if (this.timer) {
					clearInterval(this.timer)
					this.timer = null
				}
			},
			async loadLocations() {
				try {
					const res = await request({ url: '/api/locations' })
					if (!res || res.code !== 0) return
					const mine = String(res.mine)
					const list = res.list || []
					// 坐标完全相同的用户会重叠成一个点，这里按相同坐标分组、沿小圆圈散开，保证都可见
					const groups = {}
					list.forEach((p) => {
						const key = `${p.lat},${p.lng}`
						;(groups[key] || (groups[key] = [])).push(p)
					})
					const OFFSET = 0.00008 // 约 8~9 米，仅用于散开重叠点，不影响真实定位判断
					this.markers = list.map((p, i) => {
						const isMine = String(p.no) === mine
						const key = `${p.lat},${p.lng}`
						const group = groups[key]
						let lat = p.lat
						let lng = p.lng
						// 同一坐标有多个用户时，第 2 个起沿圆周均匀偏移
						if (group.length > 1) {
							const idx = group.indexOf(p)
							const angle = (2 * Math.PI * idx) / group.length
							lat += OFFSET * Math.cos(angle)
							lng += OFFSET * Math.sin(angle)
						}
						return {
							id: i + 1,
							latitude: lat,
							longitude: lng,
							// 自己蓝点，其他用户红点
							iconPath: isMine ? '/static/images/blue-dot.png' : '/static/images/red-dot.png',
							width: 24,
							height: 24,
							anchor: { x: 0.5, y: 0.5 },
							callout: isMine
								? { content: '我', color: '#1a73e8', fontSize: 12, display: 'ALWAYS', padding: 4, borderRadius: 4 }
								: { content: '用户' + p.no, color: '#ff3b30', fontSize: 12, display: 'ALWAYS', padding: 4, borderRadius: 4 }
						}
					})
					// 把地图中心移到自己的位置，并记录自己的编号与坐标（救援上报用）
					this.myNo = mine
					const me = list.find((p) => String(p.no) === mine)
					if (me) {
						this.center = { latitude: me.lat, longitude: me.lng }
						this.myLoc = { latitude: me.lat, longitude: me.lng }
					}
				} catch (e) {
					console.error('加载坐标失败', e)
				}
			},

			// 救援前确保已填电话：缓存没有则请求 profile 兜底，仍没有就弹窗补全并保存
			// 返回 true 表示已具备电话可继续救援，false 表示用户取消或保存失败
			async ensurePhone() {
				let info = getUserInfo() || {}
				let phone = String(info.dianhua || '').trim()
				// 缓存里没有电话，先向后端 /api/profile 兜底确认（可能在别处填过）
				if (!phone) {
					try {
						const res = await request({ url: '/api/profile' })
						if (res && res.code === 0 && res.userInfo) {
							info = { ...info, ...res.userInfo }
							setUserInfo(info)
							phone = String(res.userInfo.dianhua || '').trim()
						}
					} catch (e) {}
				}
				if (phone) return true

				// 确实没填电话：弹窗让用户输入
				const input = await new Promise((resolve) => {
					uni.showModal({
						title: '请先填写联系电话',
						editable: true,
						placeholderText: '请输入11位手机号，用于救援联系',
						confirmText: '保存',
						success: (r) => resolve(r.confirm ? String(r.content || '').trim() : null),
						fail: () => resolve(null)
					})
				})
				if (input === null) return false // 用户取消
				if (!/^1\d{10}$/.test(input)) {
					uni.showToast({ title: '手机号格式不正确', icon: 'none' })
					return false
				}
				// 保存到 user 表
				try {
					const res = await request({ url: '/api/profile/phone', method: 'POST', data: { dianhua: input } })
					if (res && res.code === 0) {
						setUserInfo({ ...info, dianhua: input })
						uni.showToast({ title: '电话已保存', icon: 'success' })
						return true
					}
					uni.showToast({ title: (res && res.message) || '保存失败', icon: 'none' })
					return false
				} catch (e) {
					console.error('保存电话失败', e)
					uni.showToast({ title: '网络异常，保存失败', icon: 'none' })
					return false
				}
			},

			// 点击“紧急救援”：先确保已填电话，再二次确认后上报
			async confirmSos() {
				const ok = await this.ensurePhone()
				if (!ok) return
				uni.showModal({
					title: '紧急救援',
					content: '确定要发送救援请求吗？管理后台将立即收到你的位置。',
					confirmText: '立即求救',
					confirmColor: '#ff3b30',
					success: (r) => {
						if (r.confirm) this.sendSos()
					}
				})
			},

			// 上报救援请求：POST 到后端，由后端通过 socket.io 推送给 web 端
			async sendSos() {
				this.sosLoading = true
				try {
					const info = getUserInfo() || {}
					const loc = this.myLoc || this.center
					const res = await request({
						url: '/mqtt_sub/sos',
						method: 'POST',
						data: {
							id: info.id || this.myNo || '',     // 用户 id，web 端救援消息的“设备编号”列显示
							name: info.nickname || '游客',
							lat: loc.latitude,
							lng: loc.longitude
						}
					})
					if (res && res.code === 0) {
						uni.showToast({ title: '救援请求已发送', icon: 'success' })
					} else {
						uni.showToast({ title: (res && res.message) || '发送失败', icon: 'none' })
					}
				} catch (e) {
					console.error('SOS 发送失败', e)
					uni.showToast({ title: '网络异常，发送失败', icon: 'none' })
				} finally {
					this.sosLoading = false
				}
			}
		}
	}
</script>

<style lang="scss">
.map-page {
	position: relative;
	width: 100%;
	.map {
		display: block;
		width: 100%;
	}
	.legend {
		position: fixed;
		left: 30rpx;
		bottom: 180rpx;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 12rpx;
		padding: 16rpx 24rpx;
		font-size: 26rpx;
		color: #333;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.15);
		.item {
			display: flex;
			align-items: center;
			line-height: 2;
		}
		.dot {
			width: 22rpx;
			height: 22rpx;
			border-radius: 50%;
			margin-right: 12rpx;
			&.blue { background: #1a73e8; }
			&.red { background: #ff3b30; }
		}
		.count {
			margin-top: 6rpx;
			color: #31C27C;
			font-weight: bold;
		}
	}
	.sos-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 140rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
		padding-bottom: env(safe-area-inset-bottom);
		z-index: 20;
		.sos-btn {
			width: 86%;
			height: 88rpx;
			line-height: 88rpx;
			background: #ff3b30;
			color: #fff;
			font-size: 34rpx;
			font-weight: bold;
			border-radius: 44rpx;
			border: none;
			box-shadow: 0 6rpx 18rpx rgba(255, 59, 48, 0.4);
			&::after { border: none; }
			&[disabled] { opacity: 0.6; }
		}
	}
}
</style>
