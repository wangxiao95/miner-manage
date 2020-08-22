import { authGet } from '../lib/request'

enum Path {
  getSummary = 'cgi-bin/summary.cgi',
  getSystemInfo = 'cgi-bin/get_system_info.cgi',
  getPools = 'cgi-bin/pools.cgi',
  getStats = 'cgi-bin/stats.cgi',
  getChart = 'cgi-bin/chart.cgi',
  getMinerConfig = 'cgi-bin/get_miner_conf.cgi',
  setMinerConfig = 'cgi-bin/set_miner_conf.cgi',
  // resetConfig = 'cgi-bin/reset_conf.cgi',
  reboot = 'cgi-bin/reboot.cgi'
}

interface Pool {
  url: string
  user: string
  pass: string
}

interface Miner {
  'bitmain-fan-ctrl': boolean
  'bitmain-fan-pwm': string
  'freq-level': string
  'miner-mode': string
  pools: Pool
}

interface Params {
  user: string
  password: string
  ip: string
}

const paths: Record<string, Path> = Path

export default async function commonGet(url: string, data: Params) {
  const { user, password, ip } = data
  const uri = paths[url]
  if (!uri) {
    return '404 - not found this path'
  }

  try {
    const data = await authGet(uri, {
      user,
      password,
      ip,
    })
    return data
  } catch (e) {
    console.log('err:', e);
  }
}
export const getSummary = async function(data: Params) {
  const { user, password, ip } = data

  try {
    const data = await authGet(Path.getSummary, {
      user,
      password,
      ip,
    })
    return data
  } catch (e) {
    console.log('err:', e);
  }
}
