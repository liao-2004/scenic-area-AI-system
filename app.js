const Koa = require('koa');
const cors = require('@koa/cors');
const static = require('koa-static');  
const path = require('path');
const fs = require('fs/promises');
const bodyParser = require('koa-bodyparser');
const { ReadableStream } = require('web-streams-polyfill');
global.ReadableStream = ReadableStream; // 让全局环境能访问到 ReadableStream

// 引入 Blob Polyfill 并全局注册
const { Blob } = require('blob-polyfill');
global.Blob = Blob; // 让全局环境能访问到 Blob
 const { setupDatabase } = require('./dbSetup');
const router = require('./router/user.js');
const mqtt_pub = require('./router/mqtt_pub.js');
const mqtt_sub = require('./router/mqtt_sub.js');
const mqtt = require('./router/mqtt.js');

const app = new Koa();
const port = 3000;
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  await next();
});
app.use(cors()); 
app.use(bodyParser());
const staticPath = path.join(__dirname, 'public');
app.use(static(staticPath));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(mqtt_pub.routes());
app.use(mqtt_pub.allowedMethods());
app.use(mqtt_sub.routes());
app.use(mqtt_sub.allowedMethods());
app.use(mqtt.routes());
app.use(mqtt.allowedMethods());
app.use(static(path.join(__dirname, 'dist')));
const dbSetupSuccess =  setupDatabase();
app.use(async (ctx) => { 
  ctx.type = 'text/html';
  ctx.body = await fs.readFile(path.resolve(__dirname, 'dist', 'index.html'));
});
app.listen(port, () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});