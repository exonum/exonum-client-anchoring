/* eslint-env browser */
import IdbKvStore from 'idb-kv-store'
import { to } from '../common/'

const DB = new IdbKvStore('Exonum')

export const save = async (str, name) => {
  const [res, err] = await to(DB.set(name, str))
  if (err) throw err
  return res
}

export const load = async name => {
  const [res, err] = await to(DB.get(name))
  if (err) throw err
  return res
}
