/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

require('../constants')

const store = require('../../src/store/')

describe('Store module', function () {
  const obj = { foo: 'bar' }
  const name = 'test'
  // it('when try to load by key, which is not exist', d => {
  //   store.load('not_exist')
  //     .should
  //     .eventually
  //     .deep.equal({})
  //     .notify(d)
  // })

  it('save-load check', d => {
    store.save(obj, name)
      .then(data => {
        return store.load(name)
          .should
          .eventually
          .deep.equal(obj)
          .notify(d)
      })
  })
})
