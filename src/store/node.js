import fs from 'fs'

const folder = './.cache/'

export const save = (str, name) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder)

    fs.writeFile(folder + name, JSON.stringify(str), err => {
      if (err) reject(err)
      resolve(true)
    })
  })
}

export const load = name => {
  return new Promise((resolve, reject) => {
    fs.readFile(folder + name, (err, data) => {
      if (err) resolve({})
      try {
        resolve(JSON.parse(data))
      } catch (e) {
        resolve({})
      }
    })
  })
}
