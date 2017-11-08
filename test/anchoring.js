/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const exonumAnchoring = require('src')

chai.use(chaiAsPromised)
chai.should()

describe('Anchoring', function () {
  const anchoring = new exonumAnchoring.Anchoring({
    driver: new exonumAnchoring.drivers.Blocktrail({
      token: '4bbd8b0dc28c3cf1c2d14b3291b0d75003d46372',
      network: 'tBTC'
    }),
    provider: {
      nodes: ['http://192.168.221.129']
    }
  })
  anchoring.on('loaded', e => console.log('loaded', e))
  anchoring.on('synchronized', e => console.log('synchronized', e))

  anchoring.txStatus('4e13d9246365c1cf1dafafc308e7e7ac0f303d81a10cec9beab022419a035cd3')
    .then(data => console.log(data))
})
