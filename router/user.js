const Router=require('koa-router')
const userHandle=require('../router_handle/user')
const router=new Router({ prefix: '/api' })
//这些代码跟设备表，错误信息表有关
router.post('/word',userHandle.addword)
router.get('/select',userHandle.selectword)
router.get('/select_date',userHandle.select_date)
router.get('/start',userHandle.start)
router.get('/yyy', async (ctx, next) => {
  ctx.body = '访问成功';
});
module.exports=router