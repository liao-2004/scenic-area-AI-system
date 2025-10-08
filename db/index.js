const mysql=require('mysql')

const db=mysql.createPool({
    host:'0.0.0.0',
    user:'root',
    password:'123456',
    database:'vue_beidou4'
})

module.exports=db