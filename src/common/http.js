import axios from 'axios'
import { to } from './common'

// @todo request should be using fetch with Babel
const getReq = ({ url, params }) => axios.get(url, { params }).then(({ data }) => data)

const getWithTimeout = ({ url, params, timeout = 200 }) =>
  new Promise((resolve, reject) => setTimeout(() => getReq({ url, params }).then(resolve).catch(reject), timeout))

const get = async ({ url, params, tries = 5 }) => {
  // const date = new Date()
  const [res, err] = await to(getReq({ url, params }))

  if (err) {
    if (!err.response || err.response.status >= 500) {
      let errors = [err]
      for (let i = 0; i < tries - 1; i++) {
        const [res, err] = await to(getWithTimeout({ url, params }))
        if (err) {
          errors = [...errors, err]
          continue
        }
        return res
      }
      throw errors
    } else {
      throw err
    }
  }

  // console.log((new Date() - date) + 'ms', url, JSON.stringify(params))
  return res
}

export default { get }
