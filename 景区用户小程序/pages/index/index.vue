<template>
	<view class="home">		
		<scroll-view scroll-x class="navscroll">
			<view class="item" 
			:class="index==navIndex ? 'active' : ''" v-for="(item,index) in navArr" 
			@click="clickNav(index,item.id)"
			:key="item.id"
			>{{item.classname}}</view>			
		</scroll-view>
		
		<view class="content" >
			<div class="row" v-for="item in newsArr" :key="item.id">
				<newsbox :item="item" @click.native="goDetail(item)"></newsbox>
			</div>
		</view>
		
		<view class="nodata" v-if="!newsArr.length">
			<image src="../../static/images/nodata.png" mode="widthFix"></image>
		</view>
		
		<view class="loading" v-if="newsArr.length">			
			<view v-if="loading==1">数据加载中...</view>
			<view v-if="loading==2">没有更多了~~</view>
		</view>
	</view>
</template>

<script>
	import {BASE_URL} from "@/utils/request.js"

	export default {
		data() {
			return {
				navIndex:0,
				navArr:[],
				newsArr:[],
				currentPage:1,
				currentId:'',   //当前分类id，空表示全部
				loading:0       //0默认  1加载中  2没有更多了
			}
		},
		onLoad() {
			this.getNavData();
			this.getNewsData();
		},
		onReachBottom(){
			console.log("到底部了")
			if(this.loading==2){
				return;
			}
			this.currentPage++;
			this.loading=1;
			this.getNewsData();
		},
		
		methods: {
			//点击导航切换
			clickNav(index,id){
				this.navIndex=index;	
				this.currentPage=1;	
				this.currentId=id;			
				this.newsArr=[]
				this.loading=0;
				this.getNewsData(id);
			},
			
			//跳转到详情页
			goDetail(item){				
				uni.navigateTo({
					url:`/pages/detail/detail?cid=${item.classid}&id=${item.id}`
				})
			},
			
			//获取导航列表数据（本项目后端）
			getNavData(){
				uni.request({
					url:BASE_URL+"/api/news/navlist",
					success:res=>{
						console.log(res)
						this.navArr=res.data
					}
				})
			},
			
			//获取新闻列表数据（本项目后端）
			getNewsData(){
				uni.request({
					url:BASE_URL+"/api/news/newslist",
					data:{
						cid:this.currentId,
						page:this.currentPage
					},
					success:res=>{
						console.log(res)
						if(res.data.length==0){
							this.loading=2
						}
						// 后端 picurl 存的是相对路径（如 /req_file/xxx.jpg），需补全为后端绝对地址
						const list=res.data.map(item=>{
							if(item.picurl && /^\//.test(item.picurl)){
								item.picurl=BASE_URL+item.picurl
							}
							return item
						})
						this.newsArr=[...this.newsArr,...list]
					}
				})
			}
			
		}
	}
</script>

<style lang="scss" scoped>
.navscroll{
	height: 100rpx;
	background: #F7F8FA;
	white-space: nowrap;
	position: fixed;
	top:var(--window-top);
	left:0;
	z-index: 10;
	::v-deep ::-webkit-scrollbar {
		width: 4px !important;
		height: 1px !important;
		overflow: auto !important;
		background: transparent !important;
		-webkit-appearance: auto !important;
		display: block;
	}
	.item{
		font-size: 40rpx;
		display: inline-block;
		line-height: 100rpx;
		padding:0 30rpx;
		color:#333;		
		&.active{
			color:#31C27C;
		}
	}
}

.content{
	padding:30rpx;
	padding-top:130rpx;	
	.row{
		border-bottom:1px dotted #efefef;
		padding:20rpx 0;
	}
}
.nodata{
	display: flex;
	justify-content: center;
	image{
		width: 360rpx;
	}
}
.loading{
	text-align: center;
	font-size: 26rpx;
	color:#888;
	line-height: 2em;
}
</style>
