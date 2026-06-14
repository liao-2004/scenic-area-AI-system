<template>
	<view class="map-page">
		<map
			class="map"
			:style="{ width: '100%', height: mapHeight + 'px' }"
			:latitude="center.latitude"
			:longitude="center.longitude"
			:scale="scale"
			:markers="markers"
			show-location
		></map>

		<view class="legend">
			<view class="item"><view class="dot blue"></view>我的位置</view>
			<view class="item"><view class="dot red"></view>其他用户</view>
			<view class="count">在线 {{ markers.length }} 人</view>
		</view>
	</view>
</template>

<script>
	import { request, getToken } from '@/utils/request.js'

	const REFRESH = 30 * 1000 // 每 30 秒刷新一次地图坐标

	export default {
		data() {
			return {
				center: { latitude: 27.8483, longitude: 112.9276 }, // 默认中心
				scale: 16,
				markers: [],
				timer: null,
				mapHeight: 600 // 动态计算为屏幕可用高度，避免 100vh 在小程序里塌陷
			}
		},
		onLoad() {
			// 用系统窗口高度撑满地图，最可靠
			try {
				const info = uni.getSystemInfoSync()
				this.mapHeight = info.windowHeight
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
					this.markers = list.map((p, i) => {
						const isMine = String(p.no) === mine
						return {
							id: i + 1,
							latitude: p.lat,
							longitude: p.lng,
							// 自己蓝点，其他用户红点
							iconPath: isMine ? '/static/images/blue-dot.png' : '/static/images/red-dot.png',
							width: 24,
							height: 24,
							anchor: { x: 0.5, y: 0.5 },
							callout: isMine
								? { content: '我', color: '#1a73e8', fontSize: 12, display: 'ALWAYS', padding: 4, borderRadius: 4 }
								: undefined
						}
					})
					// 把地图中心移到自己的位置
					const me = list.find((p) => String(p.no) === mine)
					if (me) {
						this.center = { latitude: me.lat, longitude: me.lng }
					}
				} catch (e) {
					console.error('加载坐标失败', e)
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
		bottom: 40rpx;
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
}
</style>
