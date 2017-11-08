import { getEnv, to } from '../common/'
import * as node from './node'
import * as browser from './browser'

export const save = async (obj, name) => {
  const env = getEnv()
  if (env === 'node') {
    const [result, err] = await to(node.save(obj, name))
    if (err) throw err
    return result
  } else {
    const [result, err] = await to(browser.save(obj, name))
    if (err) throw err
    return result
  }
}

export const load = async name => {
  const env = getEnv()
  if (env === 'node') {
    const [result, err] = await to(node.load(name))
    if (err) throw err
    return result
  } else {
    const [result, err] = await to(browser.load(name))
    if (err) throw err
    return result
  }
}
