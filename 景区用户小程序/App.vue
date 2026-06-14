<script>
	import { getToken } from '@/utils/request.js'
	import { startLocationReport, stopLocationReport } from '@/utils/location.js'

	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
			// 前台且已登录则启动/恢复坐标上报（每分钟一次，内部会先清旧定时器）
			if (getToken()) {
				startLocationReport()
			}
		},
		onHide: function() {
			console.log('App Hide')
			// 退到后台停止上报，回到前台由 onShow 之外的登录态决定
			stopLocationReport()
		}
	}
</script>

<style>
view{
	box-sizing: border-box;
}
</style>
