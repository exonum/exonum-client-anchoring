/* eslint-env browser */
import idbKeyval from 'idb-keyval'
import { to } from '../common/'

export const save = async (str, name) => {
  const [res, err] = await to(idbKeyval.set(name, str))
  if (err) throw err
  return res
}

export const load = async name => {
  const [res, err] = await to(idbKeyval.get(name))
  if (err) return {}
  return !res ? {} : res
}

export const clear = () => idbKeyval.clear()
