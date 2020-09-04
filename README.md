**dev**

**step 1**

`npm install` or `yarn`

**step 2**

`npm run dev` or `yarn dev`
    
**part 1**

`http://localhost:9001/auth/[paths]?user=root&password=root&ip=192.168.2.2`

**paths**
```bash
  getSummary
  getSystemInfo
  getPools 
  getStats 
  getChart
  getMinerConfig
  setMinerConfig
  resetConfig
  reboot
```

**part 2**

`http://localhost:9001/session/[paths]?user=admin&password=admin&ip=192.168.2.2`

**paths**
```bash
  getDevice
  getMiners
  setMinners: @method: post;  @data: [{pool:'', worker: '', pwd: ''}]
```

**build**

`npm run prod` or `yarn prod`

