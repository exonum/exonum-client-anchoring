/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const exonumAnchoring = require('../src')

chai.use(chaiAsPromised)
chai.should()

describe('Anchoring', function () {
  const anchoring = new exonumAnchoring.Anchoring({
    driver: new exonumAnchoring.drivers.Blocktrail({
      token: '4a50a18ecd7794411030dc6cb1ebd99d33e15343',
      network: 'tBTC'
    }),
    provider: {
      nodes: ['http://192.168.221.129']
    }
  })
  anchoring.txStatus('d0b70801351924bfd4db8a5546dd696ffb39b96e7d4e5b985c4cfd7a19c448db')
    .then(data => console.log(data))

  anchoring.on('loaded', e => console.log('loaded', e))
  anchoring.on('synchronized', e => console.log('synchronized', e))
  anchoring.on('error', e => console.log('error', e))
})
