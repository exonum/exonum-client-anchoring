import * as store from './node' // pkg.browser

export const save = (obj, name) => store.save(obj, name)

export const load = name => store.load(name)

export const clear = () => store.clear()
