import fs from 'fs'

const fileName = '-storage'

export const save = (str, name) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(name + fileName, JSON.stringify(str), err => {
      if (err) reject(err)
      resolve(true)
    })
  })
}

export const load = name => {
  return new Promise((resolve, reject) => {
    fs.readFile(name + fileName, (err, data) => {
      try {
        resolve(JSON.parse(data))
      } catch (e) {
        resolve({})
      }
    })
  })
}