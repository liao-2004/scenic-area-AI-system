const db=require('../db/db')
const index=require('../db/index')
const dayjs=require('dayjs')
exports.mqtt_data=async(ctx)=>{
    console.log(ctx.query.no)
    const results = await new Promise((resolve,rejust)=>{
        index.query(`select zuobiao from user_data where no=${ctx.query.no}`,(err,results)=>{
            if(err) rejust(err)
                else resolve(results)
            })
        })
    ctx.body=(results.map(item=>({
            lat:item.zuobiao.split(',')[0],
            lng:item.zuobiao.split(',')[1]
        })))
}
exports.mqtt_load=async(ctx)=>{
    console.log('mqtt_load函数')
    const results = await new Promise((resolve,rejust)=>{
        select_mysql=`
        SELECT l.*
        FROM user_data l
        INNER JOIN (
        SELECT no, MAX(time) AS time
        FROM user_data
        GROUP BY no
        ) t ON l.no = t.no AND l.time = t.time;`
        index.query(select_mysql,(err,results)=>{
            if(err) rejust(err)
                else resolve(results)
            })
        })
        console.log(results.map(item=>({
            lat:item.zuobiao.split(',')[0],
            lng:item.zuobiao.split(',')[1],
            dzwl:item.dzwl
        })))
    ctx.body=(results.map(item=>({
            lat:item.zuobiao.split(',')[0],
            lng:item.zuobiao.split(',')[1],
            dzwl:item.dzwl
        })))
}
exports.bug_mysql = async (ctx) => {
  console.log('访问bug网页中');
  try {
    // 关键：在query前调用.promise()转换为Promise接口
    const [results] = await db.promise().query('SELECT * FROM machine'); 
    ctx.body = [results, 'bug网页访问成功'];
  } catch (err) {
    console.error('数据库查询错误：', err);
    ctx.body = 'bug查询网页访问失败';
  }
};