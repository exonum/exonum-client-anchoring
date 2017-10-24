export const to = (promise) => promise.then(data => [data, null]).catch(err => [null, err])

export const byteArrayToInt = (byteArray) => {
  let value = 0
  for (let i = byteArray.length - 1; i >= 0; i--) {
    value = (value * 256) + byteArray[i]
  }

  return value
}
