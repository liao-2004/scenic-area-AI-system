<template>
    <div>
        <el-button size="mini" type="info" @click="startfun">查看</el-button>
        <el-dialog
        title="用户活动轨迹"
        :visible.sync="showModal1"
        top="5vh"
        width="70%">
        <div>
            <tlbs-map
                ref="mapRef"
                api-key="OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77"
                :center="center"
                :zoom="19"
                :style="{ borderRadius: '80px'}"
            >
                <tlbs-multi-polyline
                        ref="polylineRef"
                        :geometries="polylineGeometries"
                        :styles="styles"
                        :options="options"
                    />
            </tlbs-map>
        </div>
        <span slot="footer" class="dialog-footer">
            <!-- <el-button @click="showModal1 = false">取 消</el-button> -->
            <el-button type="primary" @click="stopFun">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>
<script>
import axios from 'axios'
export default {
    name:'sos_vue',
    props:['no'],
    data(){
        return{
             showModal1:false,
            center:{ lat: 27.84685996895247, lng: 112.92757039732737 },
            polylineGeometries: [],
            styles: {
                marker: {
                width: 20,
                height: 30,
                anchor: { x: 10, y: 30 },
                },
                polyline: {
                color: '#2C68FF', // 线填充色
                borderWidth: 2, // 边线宽度
                borderColor: '#004EE1', // 边线颜色
                lineCap: 'round',
                showArrow:true,
                arrowOptions:{
                    space:25,
                    animSpeed:18
                }
                }
            },
            options: {
                // minZoom: 5,
                zIndex: 1,
                // maxZoom: 15,
            },
            timer:null,
            IPV4:'http://127.0.0.1'
        }
    },
    watch:{
        no(newVal){
            if (newVal !== undefined && !isNaN(newVal)) {
                this.loadfun();
            }
        },
        showModal1(newVal){
            if(newVal==false){
                clearInterval(this.timer);
            }
        }
    },
    methods:{
        settimefun(){
            this.timer = setInterval(() => {
            console.log('计时器启动中')
        axios({
            url: this.IPV4+':3000/mqtt/mqtt_data',
            params: {
                no: this.no
            }
        }).then(results=>{
                if(results.data.length>1&&results.data){
                this.center={ lat: results.data[results.data.length-1].lat, lng: results.data[results.data.length-1].lng }
                this.polylineGeometries=[
                      {
                        id: 'polyline1',
                        styleId: 'polyline',
                        paths:results.data.map(item=>({
                          lat:item.lat,
                          lng:item.lng
                        })),
                        properties: { title: 'polyline' }
                      }
                    ]
                }
                }).catch(err=>{
                    if(err){
                        console.log(err.message)
                    }
                })
    }, 5000);
        },
        startfun(){
        axios({
                url:this.IPV4+':3000/mqtt/mqtt_data',
                params:{
                    no:this.no
                }
              }).then(results=>{
                if(results.data.length>1&&results.data){
                this.center={ lat: results.data[results.data.length-1].lat, lng: results.data[results.data.length-1].lng }
                this.polylineGeometries=[
                      {
                        id: 'polyline1',
                        styleId: 'polyline',
                        paths:results.data.map(item=>({
                          lat:item.lat,
                          lng:item.lng
                        })),
                        properties: { title: 'polyline' }
                      }
                    ]
                }
                }).catch(err=>{
                    if(err){
                        console.log(err.message)
                    }
                })
                this.showModal1=true
                this.settimefun()
      },
      loadfun(){
        console.log(22499)
        axios({
                url:this.IPV4+':3000/mqtt/mqtt_data',
                params:{
                    no:this.no
                }
              }).then(results=>{
                if(results.data.length>1&&results.data){
                this.center={ lat: results.data[results.data.length-1].lat, lng: results.data[results.data.length-1].lng }
                this.polylineGeometries=[
                      {
                        id: 'polyline1',
                        styleId: 'polyline',
                        paths:results.data.map(item=>({
                          lat:item.lat,
                          lng:item.lng
                        })),
                        properties: { title: 'polyline' }
                      }
                    ]
                }else if(results.data.length==1){
                    this.center={ lat: results.data[results.data.length-1].lat, lng: results.data[results.data.length-1].lng }
                }
                }).catch(err=>{
                    if(err){
                        console.log(err.message)
                    }
                })
      },
      stopFun(){
        clearInterval(this.timer);
        this.showModal1=false
      }
    },
beforeDestroy() {
    // 组件销毁前清除定时器
    clearInterval(this.timer);
}
}
</script>
<style>
</style>