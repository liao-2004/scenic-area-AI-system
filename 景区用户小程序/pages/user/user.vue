<template>
	<view class="user">
		<view class="account">
			<block v-if="userInfo">
				<view class="nick">{{userInfo.nickname || '微信用户'}}</view>
				<view class="logout" @click="handleLogout">退出登录</view>
			</block>
			<view v-else class="loginentry" @click="goLogin">点击登录</view>
		</view>
		<view class="top">
			<image src="../../static/images/history.png" mode=""></image>
			<view class="text">浏览历史</view>
			<view class="clear" v-if="listArr.length" @click="clearHistory">清除历史记录</view>
		</view>
		<view class="content">
			<view class="row" v-for="item in listArr">
				<newsbox :item="item" @click.native="goDetail(item)"></newsbox>
			</view>			
		</view>
		
		<view class="nohistory" v-if="!listArr.length">
			<image src="../../static/images/nohis.png" mode="widthFix"></image>
			<view class="text">暂无浏览记录</view>
		</view>
		
		
	</view>
</template>

<script>
	import { getUserInfo, clearToken, BASE_URL } from '@/utils/request.js'
	import { stopLocationReport } from '@/utils/location.js'

	export default {
		data() {
			return {
				listArr:[],
				userInfo:null
			};
		},
		onShow(){
			this.getData()
			this.userInfo = getUserInfo()
		},
		methods:{
			//跳转到详情页
			goDetail(item){
				uni.navigateTo({
					url:`/pages/detail/detail?cid=${item.classid}&id=${item.id}`
				})
			},

			//跳转登录页
			goLogin(){
				uni.navigateTo({ url:'/pages/login/login' })
			},

			//退出登录，清除 token
			handleLogout(){
				clearToken()
				stopLocationReport()
				this.userInfo = null
				uni.showToast({ title:'已退出登录', icon:'none' })
			},

			//清除浏览历史记录
			clearHistory(){
				uni.showModal({
					title:'提示',
					content:'确定清除全部浏览历史记录吗？',
					success:(res)=>{
						if(res.confirm){
							uni.removeStorageSync("historyArr")
							this.listArr=[]
							uni.showToast({ title:'已清除', icon:'none' })
						}
					}
				})
			},

			//获取缓存浏览记录
			getData(){
				let hisArr=uni.getStorageSync("historyArr") || []
				// 兼容旧记录：相对路径的封面补全为后端绝对地址（http 开头的保持不变）
				this.listArr=hisArr.map(item=>{
					if(item.picurl && /^\//.test(item.picurl)){
						item.picurl=BASE_URL+item.picurl
					}
					return item
				})
				console.log(this.listArr)
			}
		}
	}
</script>

<style lang="scss">
.user{
	.account{
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 40rpx 30rpx;
		background: #31C27C;
		color: #fff;
		.nick{
			font-size: 34rpx;
			font-weight: bold;
		}
		.logout{
			font-size: 26rpx;
			opacity: .9;
		}
		.loginentry{
			font-size: 34rpx;
			font-weight: bold;
		}
	}
	.top{
		position: relative;
		padding:50rpx 0;
		background: #F8F8F8;
		color:#666;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		image{
			width: 150rpx;
			height: 150rpx;
		}
		.text{
			font-size: 38rpx;
			padding-top: 20rpx;
		}
		.clear{
			position: absolute;
			right: 30rpx;
			bottom: 30rpx;
			font-size: 26rpx;
			color: #31C27C;
			padding: 8rpx 24rpx;
			border: 1px solid #31C27C;
			border-radius: 30rpx;
		}
	}
	.content{
		padding:30rpx;
		.row{
			border-bottom:1px dotted #efefef;
			padding:20rpx 0;
		}
	}
	.nohistory{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		image{
			width: 450rpx;
		}
		.text{
			font-size: 26rpx;
			color:#888;
		}
	}
}
</style>
