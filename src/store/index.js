import { getEnv, to } from '../common/'
import * as node from './node'
import * as browser from './browser'

const name = 'exonum'

export const save = async obj => {
  const env = getEnv()
  if (env === 'node') {
    const [result, err] = await to(node.save(obj, name))
    if (err) throw err
  } else {
    const [result, err] = await to(browser.save(obj, name))
    if (err) throw err
  }
}

export const load = async () => {
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