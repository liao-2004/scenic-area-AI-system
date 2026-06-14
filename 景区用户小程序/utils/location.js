// 坐标上报：登录后每分钟获取一次定位并上报后端
// 后端以登录用户 id 作为 no 存入 user_data，dwzl 默认 0，zuobiao 为 "lat,lng"
import { request, getToken } from '@/utils/request.js'

const INTERVAL = 60 * 1000 // 每分钟一次
let timer = null

// 上报一次当前坐标
export function reportOnce() {
	if (!getToken()) return // 未登录不上报
	uni.getLocation({
		type: 'gcj02', // 与国内地图（高德/腾讯）一致
		success: (res) => {
			request({
				url: '/api/location',
				method: 'POST',
				data: { lat: res.latitude, lng: res.longitude }
			}).catch((e) => console.error('坐标上报失败', e))
		},
		fail: (e) => console.error('获取定位失败', e)
	})
}

// 开始定时上报（先立即上报一次，再每分钟一次）
export function startLocationReport() {
	stopLocationReport()
	reportOnce()
	timer = setInterval(reportOnce, INTERVAL)
}

// 停止定时上报（退出登录时调用）
export function stopLocationReport() {
	if (timer) {
		clearInterval(timer)
		timer = null
	}
}
