const Koa = require('koa2')
const bodyParser = require('koa-bodyparser')
import router from './routers'
import commonGet from './core/methods'
import { getDeviceInfo } from './core/sessionAuthMethods'

const app = new Koa()

app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

// app.use(async ctx => {
//   const { user, password, ip, type } = ctx.request.query
//
//   const url = ctx.request.url.split('?')[0].replace('/', '')
//   if (type === '2') {
//     const data = await getDeviceInfo({
//       user, password, ip
//     })
//     ctx.body = data.name
//     return
//   }
//   const data = await commonGet(url, {
//     user, password, ip
//   })
//   ctx.body = data
// })

app.listen(9001)
