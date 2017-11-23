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

export const clear = () => {
  return new Promise((resolve, reject) => {
    deleteFolderRecursive(folder)
    resolve(true)
  })
}

const deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(file => {
      const curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}
