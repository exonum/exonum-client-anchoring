import 'core-js/es6/promise'
import 'core-js/fn/array/find'

import Anchoring from './Anchoring'
import drivers from './drivers/'
import Provider from './Provider'

export default {
  Anchoring,
  drivers,
  helpers: {
    parseConfigAddress: Provider.parseConfigAddress
  }
}
