const Koa = require('koa2')
const bodyParser = require('koa-bodyparser')
import router from './routers'
import commonGet from './core/methods'

const app = new Koa()

app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

app.use(async ctx => {
  const { user, password, ip } = ctx.request.query
  const url = ctx.request.url.split('?')[0].replace('/', '')
  const data = await commonGet(url, {
    user, password, ip
  })
  ctx.body = data
})

app.listen(9001)
