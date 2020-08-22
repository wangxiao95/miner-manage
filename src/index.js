const Koa = require('koa2')
const bodyParser = require('koa-bodyparser')
import router from './routers'
import commonGet from './core/methods'

const app = new Koa()

app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())
/*
 * router.allowedMethods()作用： 这是官方文档的推荐用法,我们可以
 * 看到 router.allowedMethods()用在了路由匹配 router.routes()之后,所以在当所有
 * 路由中间件最后调用.此时根据 ctx.status 设置 response 响应头
 *
 */
app.use(async ctx => {
  const {user, password, ip} = ctx.request.query
  const url = ctx.request.url.split('?')[0].replace('/', '')
  const data = await commonGet(url, {
    user, password, ip
  })
  ctx.body = data
})

app.listen(9001)
//
// const options = {
//   hostname: '192.168.2.2',
//   port: 80,
//   path: '/cgi-bin/get_miner_conf.cgi',
//   method: 'GET',
//   headers: {
//     'Connection': 'Keep-Alive',
//     'Content-Type': 'application/json',
//     'Host': '192.168.2.2'
//   }
// };
//
// let GetData = (err, data) => {
//   if (err) {
//     // console.error(1, err);
//   } else {
//     console.log(2, JSON.parse(data));
//   }
// }
//
// auth.request(options, null, "root", "root", GetData);
