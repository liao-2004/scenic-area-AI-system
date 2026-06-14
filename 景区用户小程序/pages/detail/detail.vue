<template>
	<view class="detail">
		<view class="title">{{detail.title}}</view>
		<view class="info">
			<view class="author">编辑：{{detail.author}}</view>
			<view class="time">发布日期：{{detail.posttime}}</view>
		</view>
		<view class="content">
			<rich-text :nodes="detail.content"></rich-text>			
		</view>
		<view class="description">
			声明：该消息仅供参考，非官方发布
		</view>
	</view>
</template>

<script>
	import {parseTime} from "@/utils/tool.js"
	import {BASE_URL} from "@/utils/request.js"
	
	
	export default {
		data() {
			return {
				options:null,
				detail:{}
			};
		},
		onLoad(e){			
			this.options=e;
			this.getDetail();
		},
		methods:{
			getDetail(){
				uni.request({
					url:BASE_URL+"/api/news/detail",
					data:this.options,
					success:res=>{
						console.log(res)
						res.data.posttime=parseTime(res.data.posttime)
						res.data.content=res.data.content.replace(/<img/gi,'<img style="max-width:100%"')
						// 后端 picurl 存的是相对路径（/req_file/xxx.jpg），补全为后端绝对地址，
						// 否则保存到浏览历史后封面图无法显示
						if(res.data.picurl && /^\//.test(res.data.picurl)){
							res.data.picurl=BASE_URL+res.data.picurl
						}
						this.detail=res.data
						
						this.saveHistory()
						
						uni.setNavigationBarTitle({
							title:this.detail.title
						})
					}
				})
			},
			saveHistory(){
				
				let historyArr=uni.getStorageSync("historyArr") || []
				let item={
					id:this.detail.id,
					classid:this.detail.classid,
					picurl:this.detail.picurl,
					title:this.detail.title,
					looktime:parseTime(Date.now())
				}
				
				let index=historyArr.findIndex(i=>{
					return i.id==this.detail.id
				})
				
				if(index>=0){
					historyArr.splice(index,1)
				}
								
				historyArr.unshift(item)	
				historyArr=historyArr.slice(0,10)		
				uni.setStorageSync("historyArr",historyArr)
			}
		}
	}
</script>

<style lang="scss">
.detail{
	padding:30rpx;
	.title{
		font-size: 46rpx;
		color:#333;
	}
	.info{
		background: #F6F6F6;
		padding:20rpx;
		font-size: 25rpx;
		color:#666;
		display: flex;
		justify-content: space-between;
		margin:40rpx 0;
	}
	.content{
		padding-bottom:50rpx;		
	}
	.description{
		background: #FEF0F0;
		font-size: 26rpx;
		padding:20rpx;
		color:#F89898;
		line-height: 1.8em;
	}
}
</style>
