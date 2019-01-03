/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { mock } = require('../constants').module
const Provider = require('../../src/Provider').default
const { cfg } = require('../mocks/')

describe('check switch node on errors', function () {
  const nodes = ['http://localhost:8000', 'http://localhost:8001', 'http://localhost:8002']
  const request = '/request'
  const provider = new Provider({ nodes })

  it('when all nodes not responding, return error for all', d => {
    const provider = new Provider({ nodes })
    nodes.forEach(item => mock.onGet(`${item}/api/services/configuration/v1${request}`).replyOnce(500))

    provider.getFromNode({ key: 'configuration', url: request })
      .catch(err => err.map(err => err.map(item => item.response.status)))
      .should
      .eventually
      .deep.equal([[500, 404], [500, 404], [500, 404]])
      .notify(d)
  })

  it('when one node responding, return response', d => {
    mock.onGet(`${nodes[0]}/api/services/configuration/v1${request}`).replyOnce(500)
    mock.onGet(`${nodes[1]}/api/services/configuration/v1${request}`).replyOnce(500)
    mock.onGet(`${nodes[2]}/api/services/configuration/v1${request}`).replyOnce(200, cfg)
    provider.getFromNode({ key: 'configuration', url: request })
      .should
      .eventually
      .deep.equal(cfg)
      .notify(d)
  })

  it('start next request from responding node', d => {
    mock.onGet(`${nodes[0]}/api/services/configuration/v1${request}/test`).replyOnce(200, {})
    mock.onGet(`${nodes[1]}/api/services/configuration/v1${request}/test`).replyOnce(200, {})
    mock.onGet(`${nodes[2]}/api/services/configuration/v1${request}/test`).replyOnce(200, cfg)
    provider.getFromNode({ key: 'configuration', url: request + '/test' })
      .should
      .eventually
      .deep.equal(cfg)
      .notify(d)
  })

  it('when only one node, make usual requests', d => {
    const provider = new Provider({ nodes: [nodes[0]] })
    for (let i = 0; i < 5; i++) {
      mock.onGet(`${nodes[0]}/api/services/configuration/v1${request}/test`).replyOnce(500 + i)
    }

    provider.getFromNode({ key: 'configuration', url: request + '/test' })
      .catch(err => err.map(item => item.response.status))
      .should
      .eventually
      .deep.equal([500, 501, 502, 503, 504])
      .notify(d)
  })
})
