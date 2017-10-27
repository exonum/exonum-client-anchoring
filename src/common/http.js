import axios from 'axios'
import { to } from './common'

// @todo request should be using fetch with Babel
const getReq = ({ url, params }) => axios.get(url, { params }).then(({ data }) => data)

const getWithTimeout = ({ url, params, timeout = 200 }) =>
  new Promise((res, rej) => setTimeout(() => getReq({ url, params }).then(res).catch(rej), timeout))

const get = async ({ url, params, tries = 5, }) => {
  console.log(url, params)
  let errors = []
  const [res, err] = await to(getReq({ url, params }))

  if (err) {
    for (let i = 0; i < tries - 1; i++) {
      const [res, err] = await to(getWithTimeout({ url, params }))
      if (err) {
        errors = [...errors, err]
        continue
      }
      return res
    }
    throw new Error(errors)
  }

  return res
}

export default {
  get
}