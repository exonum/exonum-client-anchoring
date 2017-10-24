const map = new WeakMap()

export default key => {
  if (!map.has(key)) {
    map.set(key, {})
  }
  return map.get(key)
}
