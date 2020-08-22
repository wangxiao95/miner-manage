**dev**

**step 1**

`npm install` or `yarn`

**step 2**

`npm run dev` or `yarn dev`
    
**浏览器**

`http://localhost:9001/[paths]?user=root&password=root&ip=192.168.2.2`

**paths**
```bash
enum Path {
  getSummary = 'cgi-bin/summary.cgi',
  getSystemInfo = 'cgi-bin/get_system_info.cgi',
  getPools = 'cgi-bin/pools.cgi',
  getStats = 'cgi-bin/stats.cgi',
  getChart = 'cgi-bin/chart.cgi',
  getMinerConfig = 'cgi-bin/get_miner_conf.cgi',
  setMinerConfig = 'cgi-bin/set_miner_conf.cgi',
  resetConfig = 'cgi-bin/reset_conf.cgi',
  reboot = 'cgi-bin/reboot.cgi'
}
```

**build**

`npm run prod` or `yarn prod`

