// @ts-ignore
import axios from 'axios'
import * as https from 'https'
import cheerio from 'cheerio'
import _ from 'lodash'
// import FormData from 'FormData'
import FormData from 'form-data'
import * as fs from 'fs'
import * as path from 'path'

let session = ''
let token = ''

const maxRetryCount = 3
const retryCount: Record<string, number> = {
  getDeviceInfo: 0,
  getMiners: 0,
}

interface Params {
  user: string
  password: string
  ip: string
  miners?: {
    pool: string
    worker: string
    pwd: string
  }[]
}

interface DeviceInfo {
  name: string
}

async function getSession(options: Params): Promise<string> {
  const { user, password, ip } = options

  return new Promise((resolve, reject) => {
    https.get(`https://${ip}/cgi-bin/luci?luci_username=${user}&luci_password=${password}`, {
      rejectUnauthorized: false,
    }, async res => {
      session = res.headers['set-cookie'][0]
      await getToken(options)
      resolve(session)
    }).on('error', e => {
      reject(e)
    })
  })
}

async function getToken(options: Params) {
  const { ip } = options

  try {
    const res = await axios.request({
      url: `https://${ip}/cgi-bin/luci/`,
      method: 'get',
      headers: {
        Cookie: session,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    })
    const $ = cheerio.load(res.data)
    token = $('input[name="token"]').val()
    return token
  } catch (e) {
    console.log(e)
  }
}


export const getDeviceInfo = async function (options: Params) {
  const { ip } = options

  if (!session) {
    await getSession(options)
  }
  try {
    const res = await axios.request({
      url: `https://${ip}/cgi-bin/luci/admin/status/overview`,
      method: 'get',
      headers: {
        Cookie: session,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    })
    const $ = cheerio.load(res.data)
    const name = $('.cbi-section').eq(0).find('table').find('tbody').find('tr').eq(1).find('td').eq(1).text()
    return {
      code: 200,
      data: {
        name: name.replace('.unknown.', ''),
      },
      message: 'success'
    }
  } catch (e) {
    if (e.response.status === 403 && retryCount['getDeviceInfo'] <= maxRetryCount) {
      console.log(retryCount['getDeviceInfo'])
      retryCount['getDeviceInfo'] ++
      session = ''
      return await getDeviceInfo(options)
    } else {
      return {
        code: 500,
        message: 'Service error and retry failed'
      }
    }
  }
}

export const getMiners = async function (options: Params) {
  const { ip } = options

  if (!session) {
    await getSession(options)
  }
  try {
    const res = await axios.request({
      url: `https://${ip}/cgi-bin/luci/admin/network/cgminer`,
      method: 'get',
      headers: {
        Cookie: session,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    })
    const $ = cheerio.load(res.data)
    const miners = _.map([...new Array(3)], (item, i) => {
      return {
        poolUrl: $(`input[id="cbid.pools.default.pool${i + 1}url"]`).val(),
        poolWorker: $(`input[id="cbid.pools.default.pool${i + 1}user"]`).val(),
        poolPwd: $(`input[id="cbid.pools.default.pool${i + 1}pw"]`).val(),
      }
    })

    return {
      code: 200,
      data: {
        miners,
      },
      message: 'success'
    }
  } catch (e) {
    if (e.response.status === 403 && retryCount['getMiners'] <= maxRetryCount) {
      console.log(retryCount['getMiners'])
      retryCount['getMiners'] ++
      session = ''
      return await getMiners(options)
    } else {
      return {
        code: 500,
        message: 'Service error and retry failed',
      }
    }
  }
}

export const setMiners = async function (options: Params) {
  const { ip, miners } = options

  if (!session) {
    await getSession(options)
  }
  const form = new FormData()
  _.each(miners, (item, i) => {
    form.append(`cbid.pools.default.pool${i + 1}url`, item.pool)
    form.append(`cbid.pools.default.pool${i + 1}user`, item.worker)
    form.append(`cbid.pools.default.pool${i + 1}pw`, item.pwd)
  })
  form.append('token', token)
  form.append('cbi.submit', '1')
  form.append('cbid.pools.default.coin_type', 'BTC')
  form.append('cbi.apply', '保存&应用')

  form.submit({
    hostname: ip,
    port: 443,
    path: '/cgi-bin/luci/admin/network/cgminer',
    protocol: 'https:',
    // url: `https://${ip}/cgi-bin/luci/admin/network/cgminer`,
    headers: {
      Cookie: session,
    },
    rejectUnauthorized: false,
  }, (err, res) => {
    res.resume()
    // console.log(err)
    // console.log(res.resume())
    let rawData = ''
    res.on('data', (chunk) => {
      rawData += chunk
    })
    res.on('end', async () => {
      // console.log(rawData)
      fs.writeFileSync(path.resolve('./log.html'), rawData)
      await applySetMiner(options)
      // try {
      //   const parsedData = JSON.parse(rawData);
      //   console.log(parsedData);
      // } catch (e) {
      //   console.error(e.message);
      // }
    })
  })

  // try {
  //   const res = await axios.request({
  //     url: `https://${ip}/cgi-bin/luci/admin/network/cgminer`,
  //     method: 'post',
  //     headers: {
  //       Cookie: session,
  //       'Content-Type': 'multipart/form-data',
  //     },
  //     data: form,
  //     httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  //   })
  //   // const poolState = await applySetMiner(options)
  //   // console.log(poolState)
  //   // return {
  //   //   code: 200,
  //   //   data: true,
  //   //   message: 'success',
  //   // }
  //   console.log(form.fields)
  //   console.log(session)
  //   console.log(token)
  //   return res.data
  // } catch (e) {
  //   console.log(e)
  //   if (e.response.status === 403 && retryCount['setMiners'] <= maxRetryCount) {
  //     console.log(retryCount['setMiners'])
  //     retryCount['setMiners']++
  //     session = ''
  //     return await setMiners(options)
  //   } else {
  //     return {
  //       code: 500,
  //       message: 'Service error and retry failed',
  //     }
  //   }
  // }
}


async function applySetMiner(options: Params) {
  const { ip } = options
  const form = new FormData()

  form.append('token', token)
  form.append('redir', '/cgi-bin/luci/admin/network/cgminer')

  form.submit({
    hostname: ip,
    port: 443,
    path: '/cgi-bin/luci//admin/uci/apply',
    protocol: 'https:',
    headers: {
      Cookie: session,
    },
    rejectUnauthorized: false,
  }, (err, res) => {
    res.resume()
    let rawData = ''
    res.on('data', (chunk) => {
      rawData += chunk
    })
    res.on('end', async () => {
      console.log(rawData)
      // try {
      //   const parsedData = JSON.parse(rawData);
      //   console.log(parsedData);
      // } catch (e) {
      //   console.error(e.message);
      // }
    })
  })
}
