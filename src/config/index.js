export const getConfig = function (method, path, ip){
  return {
    hostname: ip || '192.168.2.2',
    port: 80,
    path: path || '/cgi-bin/get_miner_conf.cgi',
    method: method,
    headers: {
      'Connection': 'Keep-Alive',
      'Content-Type': 'application/json',
      'Host': ip || '192.168.2.2'
    }
  }
}
