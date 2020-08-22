import request from './node-digest-auth'
import { getConfig } from '../config/index'

interface Options {
  user: string
  password: string
  ip: string
  data?: any
}

export const authGet = function (path: string, options: Options): Promise<any> {
  const {user, password, ip, data} = options

  return new Promise((resolve, reject) => {
    request(
      getConfig('GET', path, ip),
      data,
      user,
      password,
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
  })
}

export const authPost = function (path: string, options: Options): Promise<any> {
  const {user, password, ip, data} = options

  return new Promise((resolve, reject) => {
    request(
      getConfig('POST', path, ip),
      data,
      user,
      password,
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
  })
}
