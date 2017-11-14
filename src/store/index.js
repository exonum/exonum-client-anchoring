import { to } from '../common/'
import * as store from './node' // pkg.browser

export const save = async (obj, name) => {
  const [result, err] = await to(store.save(obj, name))
  if (err) throw err
  return result
}

export const load = async name => {
  const [result, err] = await to(store.load(name))
  if (err) throw err
  return result
}
