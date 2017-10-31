export const save = async (str, name) => {
  try {
    localStorage.setItem(name, JSON.stringify(str))
  }
  catch (err) {
    throw err
  }
}

export const load = async name => {
  try {
    return JSON.parse(localStorage.getItem(name))
  }
  catch (err) {
    throw err
  }
}