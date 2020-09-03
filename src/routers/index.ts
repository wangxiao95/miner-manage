import commonGet from '../core/methods'
import * as https from 'https'
import { getDeviceInfo, getMiners, setMiners } from '../core/sessionAuthMethods'

const router = require('koa-router')()

router.get('/auth', async ctx => {
  const { user, password, ip } = ctx.request.query
  const url = ctx.request.url.split('?')[0].replace('/', '')

  const data = await commonGet(url, {
    user, password, ip,
  })
  ctx.body = data
})

router.get('/session/getDevice', async ctx => {
  const { user, password, ip } = ctx.request.query
  try {
    const data = await getDeviceInfo({
      user, password, ip
    })
    ctx.body = data
  } catch (e) {
    console.log(e)
  }
})

router.get('/session/getMiners', async ctx => {
  const { user, password, ip } = ctx.request.query
  try {
    const data = await getMiners({
      user, password, ip
    })
    ctx.body = data
  } catch (e) {
    console.log(e)
  }
})

router.post('/session/setMiners', async ctx => {
  const { user, password, ip } = ctx.request.query

  const miners = ctx.request.body
  try {
    const data = await setMiners({
      user, password, ip, miners
    })
    ctx.body = data
  } catch (e) {
    console.log(e)
  }
})



// router.get('/session/setMiners', async ctx => {
//   const { user, password, ip } = ctx.request.query
//   try {
//     const data = await setMiners({
//       user, password, ip
//     })
//     ctx.body = data
//   } catch (e) {
//     console.log(e)
//   }
// })

router.post('/post', ctx => {
  ctx.body = ctx.request.query
})

export default router
