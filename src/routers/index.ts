const router = require('koa-router')()

// router.get('/getSummary', async ctx => {
//   const { user, password, ip } = ctx.request.query
//   const data = await getSummary({
//     user, password, ip
//   })
//   ctx.body = data
// })

router.post('/post', ctx => {
  ctx.body = ctx.request.query
})

export default router
