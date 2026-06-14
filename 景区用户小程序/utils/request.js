// 统一请求封装：自动携带 token，登录相关方法
// 后端基础地址（本地调试 http://localhost:3000，真机/部署请改成服务器地址）
export const BASE_URL = 'http://localhost:3000'

const TOKEN_KEY = 'token'
const USERINFO_KEY = 'userInfo'

// ===== token / 用户信息本地存储 =====
export function getToken() {
	return uni.getStorageSync(TOKEN_KEY) || ''
}
export function setToken(token) {
	uni.setStorageSync(TOKEN_KEY, token)
}
export function clearToken() {
	uni.removeStorageSync(TOKEN_KEY)
	uni.removeStorageSync(USERINFO_KEY)
}
export function getUserInfo() {
	return uni.getStorageSync(USERINFO_KEY) || null
}
export function setUserInfo(info) {
	uni.setStorageSync(USERINFO_KEY, info)
}

// ===== 通用请求：自动在请求头带上 token，401 自动跳登录 =====
export function request({ url, method = 'GET', data = {}, header = {} } = {}) {
	const token = getToken()
	return new Promise((resolve, reject) => {
		uni.request({
			url: url.startsWith('http') ? url : BASE_URL + url,
			method,
			data,
			header: {
				// 后端 authMiddleware 读取 Authorization: Bearer <token>
				...(token ? { Authorization: 'Bearer ' + token } : {}),
				...header
			},
			success: (res) => {
				if (res.statusCode === 401) {
					// token 失效，清理并跳转登录
					clearToken()
					uni.reLaunch({ url: '/pages/login/login' })
					reject(res)
					return
				}
				resolve(res.data)
			},
			fail: reject
		})
	})
}

// ===== 微信登录：uni.login 拿 code -> 后端换 openid+token =====
export function wechatLogin() {
	return new Promise((resolve, reject) => {
		uni.login({
			provider: 'weixin',
			success: async (loginRes) => {
				if (!loginRes.code) {
					reject(new Error('未获取到 code'))
					return
				}
				try {
					// 把 code 传给自己的后端接口
					const res = await request({
						url: '/api/login',
						method: 'POST',
						data: { code: loginRes.code }
					})
					if (res && res.code === 0 && res.token) {
						// 前端存储 token，后续请求自动携带
						setToken(res.token)
						if (res.userInfo) setUserInfo(res.userInfo)
						resolve(res)
					} else {
						reject(new Error((res && res.message) || '登录失败'))
					}
				} catch (e) {
					reject(e)
				}
			},
			fail: reject
		})
	})
}
