/* eslint-env node, mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const exonumAnchoring = require('../src').default
const store = require('../src/store/')
const sinon = require('sinon')

const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const mock = new MockAdapter(axios)
const { expect } = chai

chai.use(chaiAsPromised)
chai.should()

const token = 'token'
const network = 'BTC'
const provider = 'http://node.com:8000'
const blockTrailAPI = 'https://api.blocktrail.com'
const config = {
  cache: false,
  driver: new exonumAnchoring.drivers.Blocktrail({ token, network }),
  provider: { nodes: [provider] }
}

beforeEach(() => {
  mock.reset()
  store.clear()
})

exports.module = {
  mock,
  expect,
  sinon,
  exonumAnchoring,

  token,
  network,
  provider,
  blockTrailAPI,
  config
}
