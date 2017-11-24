import { _ } from './common/'

export default function Events () {
  _(this).events = {}

  _(this).dispatch = (event, data) => {
    if (_(this).events[event]) {
      for (let callback of _(this).events[event]) {
        callback(data)
      }
    }
  }

  this.on = (event, callback) => {
    if (_(this).events[event]) {
      _(this).events[event].push(callback)
    } else {
      _(this).events[event] = [callback]
    }
    return true
  }

  this.off = (event, callback) => {
    if (callback && _(this).events[event] && _(this).events[event].length > 0) {
      const index = _(this).events[event].indexOf(callback)
      if (index > -1) {
        _(this).events[event].splice(index, 1)
        return true
      }
    }
    return false
  }
}
