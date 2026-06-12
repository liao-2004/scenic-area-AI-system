<template>
    <div>
        <div :style="{display:'flex','justify-content':'space-between'}">
                <h5 :style="{margin:'auto 25px',fontWeight: '900'}">用户管理</h5>
                <div style="width: 20vw;">
                  <el-input :placeholder="`请输入${select_list[select-1].label}`" :style="{width:'20vw'}" v-model="input3" class="input-with-select">
                    <el-select v-model="select" slot="prepend" placeholder="请选择" :style="{width:'105px'}">
                      <el-option label="手环编号" value="1"></el-option>
                      <el-option label="用户姓名" value="2"></el-option>
                      <el-option label="用户电话" value="3"></el-option>
                    </el-select>
                    {{ select_list[select-1] }}
                    <el-button slot="append" icon="el-icon-search"></el-button>
                  </el-input>
                </div>
              </div>
              <div :style="{display:'flex',}">
              <div :style="{width:'880px',}">
                <el-table
                :data="tableData"
                :style="{width: '100%',height:'570px'}">
                  <el-table-column
                    label="姓名"
                    width="180">
                    <template slot-scope="scope">
                      <span style="margin-left: 10px">{{ scope.row.username }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="编号"
                    width="180">
                    <template slot-scope="scope">
                      <span style="margin-left: 10px">{{ scope.row.id }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="电话"
                    width="180">
                    <template slot-scope="scope">
                      <span style="margin-left: 10px">{{ scope.row.dianhua }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="查看位置">
                    <template slot-scope="scope"> 
                        <user_guiji :no="scope.row.id"></user_guiji>
                    </template>
                  </el-table-column>
                </el-table>
            <div :style="{margin:'40px',display:'flex',alignItems:'center',justifyContent:'center',gap:'15px'}">
              <el-button>上一页</el-button> {{ index+1 }}<el-button>下一页</el-button><el-button 
                type="success" 
                icon="el-icon-download" 
                @click="downloadTable"
            >
                下载今日入园旅客信息
            </el-button>
            </div>
        </div>
        <div>
          <user_img></user_img>
        </div>
      </div>
    </div>
</template>
<script>
import { saveAs } from 'file-saver';
import axios from 'axios'
import user_guiji from './user_guiji_vue.vue'
import user_img from './user_img.vue'
export default {
    name:'user_vue',
    data(){
        return{
          select_list:[
            {id:1,label:'ID'},
            {id:2,label:'用户名'},
            {id:3,label:'用户电话'},
          ],
            index:0,
            input3: '',
            tableData: [
              {
              id:0,
          date: '2025-08-17 15:24',
          sos_date: '2025-08-16 21:24',
          username: '王小虎',
          lat: '27.848293370695384', 
          lng: '112.92757039732784',
          address: '上海市普陀区金沙江路 1518 弄',
          ok_value:true,
          danwei:'--',
          dianhua:'13654787865'
        }, {
          id:1,
          date: '2025-08-17 12:24',
          sos_date: '2025-08-17 21:24',
          username: '李一',
          lat: '27.848303691422696', 
          lng: '112.92880420724111',
          address: '上海市普陀区金沙江路 1517 弄',
          ok_value:true,
          danwei:'--',
          dianhua:'13654771455'
        }, {
          id:2,
          date: '2025-08-17 11:24',
          sos_date: '2025-08-17 21:24',
          username: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '上海市普陀区金沙江路 1519 弄',
          ok_value:true,
          danwei:'--',
          dianhua:'13745816865'
        }, {
          id:3,
          date: '2025-08-17 11:23',
          sos_date: '2025-08-17 21:24',
          username: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '上海市普陀区金沙江路 1516 弄',
          ok_value:true,
          danwei:'--',
          dianhua:'13654425865'
        }, {
          id:4,
          date: '2025-08-17 11:22',
          sos_date: '2025-08-17 21:24',
          username: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '上海市普陀区金沙江路 1519 弄',
          ok_value:true,
          danwei:'--',
          dianhua:'13674517865'
        }, {
          id:5,
          date: '2025-08-17 11:21',
          sos_date: '2025-08-17 21:24',
          username: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '上海市普陀区金沙江路 1516 弄',
          ok_value:true,
          danwei:'--',
          dianhua:'13748487865'
        }, {
          id:6,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          username: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '上海市普陀区金沙江路 1519 弄',
          ok_value:true,
          danwei:'--',
          dianhua:'13745687865'
        }, {
          id:7,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          username: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '上海市普陀区金沙江路 1516 弄',
          ok_value:true,
          danwei:'--',
          dianhua:'13675417865'
        }, {
          id:8,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          username: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '上海市普陀区金沙江路 1519 弄',
          ok_value:true,
          danwei:'--',
          dianhua:'13657895865'
        }, {
          id:9,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          username: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '上海市普陀区金沙江路 1516 弄',
          ok_value:true,
          danwei:'--',
          dianhua:'13654845165'
        }, {
          id:10,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          username: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '上海市普陀区金沙江路 1519 弄',
          ok_value:true,
          danwei:'--',
          dianhua:'13654954165'
        }, {
          id:11,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          username: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '上海市普陀区金沙江路 1516 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:12,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          username: '李二',
          lat: '27.846732842719007', 
          lng: '112.92890809148969',
          address: '上海市普陀区金沙江路 1519 弄',
          ok_value:true,
          danwei:'--'
        }, {
          id:13,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          username: '李三',
          lat: '27.84585384656255', 
          lng: '112.92768974558624',
          address: '上海市普陀区金沙江路 1516 弄',
          ok_value:true,
          danwei:'--'
        },{
              id:14,
          date: '2025-08-17 11:20',
          sos_date: '2025-08-17 21:24',
          username: '王小虎',
          lat: '27.848293370695384', 
          lng: '112.92757039732784',
          address: '上海市普陀区金沙江路 1518 弄',
          ok_value:true,
          danwei:'--'
        }
      ],
            IPV4:'http://127.0.0.1:3000',
            select:'1',
            new_list:[]
        }
    },
    components:{
        user_guiji,
        user_img
    },
    methods:{
        load_fun(){
            axios({
                url:`${this.IPV4}/api/select`,
                params:{
                    index:this.index*11
                }
            }).then(results=>{
                // this.tableData=results.data
                console.log(results)
            })
        },
        downloadTable() {
          axios({
          url:this.IPV4+'/api/select_date'
        }).then(results=>{
          if (results.length === 0) {
                this.$message.warning('暂无数据可下载');
                return;
            }
            this.new_list=results.data.map(item=>item[0])
            console.log(this.new_list,'===========----')

            // 1. 定义CSV表头（与表格列对应）
            const headers = [
                '姓名',
                '设备编号',
                '电话',
                '注册时间'
            ];

            // 2. 转换数据为CSV行
            const rows = this.new_list.map(row => [
                row.username || '', // 处理可能的空值
                row.no || '',
                row.dianhua || '',
                row.time || ''
            ]);

            // 3. 组合CSV内容（表头 + 数据行）
            const csvContent = [
                headers.join(','), // 表头行
                ...rows.map(row => row.join(',')) // 数据行
            ].join('\n');

            // 4. 创建Blob对象并下载
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            // 文件名格式：救援信息_yyyyMMddHHmmss.csv
            const fileName = `救援信息_${this.formatDate()}.csv`;
            saveAs(blob, fileName);

            this.$message.success('表格下载成功');
            })
        },

        // 辅助方法：格式化当前时间为文件名格式
        formatDate() {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}${month}${day}${hours}${minutes}${seconds}`;
        }
    },
    mounted(){
        this.load_fun()
    }
}
</script>
<style>
.cell{
  padding-left: 200px;
}
</style>