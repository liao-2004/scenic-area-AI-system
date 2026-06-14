<template>
	<view class="ai-page">
		<!-- 对话区 -->
		<scroll-view class="chat" scroll-y :scroll-top="scrollTop" :style="{ height: chatHeight + 'px' }">
			<view class="welcome" v-if="!list.length">
				<image class="avatar" src="../../static/images/ai-h.png" mode="widthFix"></image>
				<view class="hi">你好，我是景区AI助手</view>
				<view class="sub">问我木鱼湖周边的吃喝玩乐、路线、景点吧～</view>
			</view>

			<view v-for="(item, i) in list" :key="i" class="row" :class="item.role">
				<view class="bubble">{{ item.text }}</view>
			</view>

			<view v-if="loading" class="row assistant">
				<view class="bubble typing">思考中...</view>
			</view>
		</scroll-view>

		<!-- 输入区 -->
		<view class="inputbar">
			<input
				class="ipt"
				v-model="text"
				type="text"
				placeholder="请输入你的问题"
				confirm-type="send"
				@confirm="send"
			/>
			<button class="sendbtn" :disabled="loading || !text.trim()" @click="send">发送</button>
		</view>
	</view>
</template>

<script>
	import { BASE_URL } from '@/utils/request.js'

	// 每次提问自动加在问题前面的位置上下文
	const LOCATION_PREFIX = '我现在在湖南省湘潭市木鱼湖这，我下面的问题也得围绕这个地方回答。'

	export default {
		data() {
			return {
				text: '',
				list: [],        // { role: 'user' | 'assistant', text }
				loading: false,
				scrollTop: 0,
				chatHeight: 400
			}
		},
		onLoad() {
			try {
				const info = uni.getSystemInfoSync()
				// 预留底部输入栏高度（约 110rpx 换算 px）
				this.chatHeight = info.windowHeight - uni.upx2px(120)
			} catch (e) {}
		},
		methods: {
			async send() {
				const question = this.text.trim()
				if (!question || this.loading) return

				// 界面上只显示用户原始问题
				this.list.push({ role: 'user', text: question })
				this.text = ''
				this.loading = true
				this.scrollToBottom()

				try {
					// 发送给后端前自动拼上位置上下文
					const fullText = LOCATION_PREFIX + question
					const res = await this.requestAI(fullText)
					const answer = (res && res.data && res.data.answer) || res.message || '抱歉，没有获取到回答'
					this.list.push({ role: 'assistant', text: answer })
				} catch (e) {
					console.error('AI 请求失败', e)
					this.list.push({ role: 'assistant', text: '网络异常，请稍后再试' })
				} finally {
					this.loading = false
					this.scrollToBottom()
				}
			},

			// 纯文本提问：用 JSON 提交。
			// uni-app 各端对 urlencoded + 对象 data 的序列化不一致（H5/小程序可能不转成表单串），
			// 导致后端收不到 text 而走默认值；改用 JSON 各端都能可靠序列化。
			// 后端 multer 的 upload.single 只处理 multipart，非 multipart 放行，
			// 由全局 koa-bodyparser 解析出 ctx.request.body.text。
			requestAI(fullText) {
				return new Promise((resolve, reject) => {
					uni.request({
						url: BASE_URL + '/ai/chat',
						method: 'POST',
						header: { 'content-type': 'application/json' },
						data: { text: fullText },
						success: (res) => resolve(res.data),
						fail: reject
					})
				})
			},

			scrollToBottom() {
				this.$nextTick(() => {
					// 给一个足够大的值滚到底
					this.scrollTop = 100000 + Math.floor(this.list.length)
				})
			}
		}
	}
</script>

<style lang="scss">
.ai-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #F2F3F5;

	.chat {
		padding: 24rpx;
		box-sizing: border-box;

		.welcome {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: 120rpx;
			.avatar { width: 120rpx; }
			.hi {
				font-size: 34rpx;
				color: #333;
				font-weight: bold;
				margin-top: 20rpx;
			}
			.sub {
				font-size: 26rpx;
				color: #999;
				margin-top: 12rpx;
			}
		}

		.row {
			display: flex;
			margin-bottom: 24rpx;
			&.user { justify-content: flex-end; }
			&.assistant { justify-content: flex-start; }

			.bubble {
				max-width: 76%;
				padding: 20rpx 24rpx;
				border-radius: 16rpx;
				font-size: 30rpx;
				line-height: 1.6;
				word-break: break-all;
				white-space: pre-wrap;
			}
			&.user .bubble {
				background: #31C27C;
				color: #fff;
				border-top-right-radius: 4rpx;
			}
			&.assistant .bubble {
				background: #fff;
				color: #333;
				border-top-left-radius: 4rpx;
			}
			.typing { color: #999; }
		}
	}

	.inputbar {
		display: flex;
		align-items: center;
		padding: 16rpx 24rpx;
		background: #fff;
		border-top: 1rpx solid #eee;

		.ipt {
			flex: 1;
			height: 72rpx;
			background: #F2F3F5;
			border-radius: 36rpx;
			padding: 0 28rpx;
			font-size: 30rpx;
		}
		.sendbtn {
			width: 140rpx;
			height: 72rpx;
			line-height: 72rpx;
			margin: 0 0 0 20rpx;
			padding: 0;
			font-size: 30rpx;
			color: #fff;
			background: #31C27C;
			border-radius: 36rpx;
			&[disabled] { background: #a8d8c0; }
		}
	}
}
</style>
