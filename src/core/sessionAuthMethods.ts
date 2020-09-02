// @ts-ignore
import axios from 'axios'
import * as https from 'https'
import cheerio from 'cheerio'
import _ from 'lodash'

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
}

interface DeviceInfo {
  name: string
}

async function getSession(options: Params): Promise<string> {
  const { user, password, ip } = options

  return new Promise((resolve, reject) => {
    https.get(`https://${ip}/cgi-bin/luci?luci_username=${user}&luci_password=${password}`, {
      rejectUnauthorized: false,
    }, res => {
      session = res.headers['set-cookie'][0]
      getToken(options)
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
        message: 'Service error and retry failed'
      }
    }
  }
}
