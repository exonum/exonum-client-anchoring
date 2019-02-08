/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */
const { expect } = require('../constants').module

const Provider = require('../../src/Provider').default

describe('address', function () {
  it('parsing address with one ancoring key and bitcoin network', () => {
    const address = Provider.parseConfigAddress({ services: {
      'btc_anchoring': {
        'public_keys': [
          '031cf96b4fef362af7d86ee6c7159fa89485730dac8e3090163dd0c282dbc84f22'
        ],
        'fee': 20000,
        'frequency': 500,
        'funding_tx': '02000000000101d698a340c2e62333c755036d0a28f7b59aebcff41bb47b079013d53ec13c928f0000000000feffffff0200e1f50500000000220020b14ed487701bc016287ebf3805dffeb8a2ccd660925a49cb92be43dc4a22f947bf524b0000000000160014a47d870d80b4d91961366a54db62e38c34d5914602473044022044102b49ac55030f20cfc225f4a6e6ea8dbc11c864bbca3b1386357b6b8e1539022059e3469863027983c9f7a91a824577f1fb315c2122e0d0acbd607b4e237b450a0121035c0eb43dc40529a51f78c8f4dd8ec940d4f2b6893cf64b9255fcd7bf639e60d115aa1400',
        'network': 'bitcoin',
        'utxo_confirmations': 5
      },
      'configuration': null
    } })
    expect(address).to.deep.equal('bc1qenu9uhhymgc5tsg0ssfjjve3z2ajq2murl4dvutzfp6y0ylmxx2sfcc7ny')
  })

  it('parsing address with one ancoring key and testnet network', () => {
    const address = Provider.parseConfigAddress({ services: {
      'btc_anchoring': {
        'public_keys': [
          '031cf96b4fef362af7d86ee6c7159fa89485730dac8e3090163dd0c282dbc84f22'
        ],
        'fee': 20000,
        'frequency': 500,
        'funding_tx': '02000000000101d698a340c2e62333c755036d0a28f7b59aebcff41bb47b079013d53ec13c928f0000000000feffffff0200e1f50500000000220020b14ed487701bc016287ebf3805dffeb8a2ccd660925a49cb92be43dc4a22f947bf524b0000000000160014a47d870d80b4d91961366a54db62e38c34d5914602473044022044102b49ac55030f20cfc225f4a6e6ea8dbc11c864bbca3b1386357b6b8e1539022059e3469863027983c9f7a91a824577f1fb315c2122e0d0acbd607b4e237b450a0121035c0eb43dc40529a51f78c8f4dd8ec940d4f2b6893cf64b9255fcd7bf639e60d115aa1400',
        'network': 'testnet',
        'utxo_confirmations': 5
      },
      'configuration': null
    } })
    expect(address).to.deep.equal('tb1qenu9uhhymgc5tsg0ssfjjve3z2ajq2murl4dvutzfp6y0ylmxx2s7sw3ft')
  })

  it('parsing address with four ancoring keys and testnet network', () => {
    const address = Provider.parseConfigAddress({ services: {
      'btc_anchoring': {
        'public_keys': [
          '031cf96b4fef362af7d86ee6c7159fa89485730dac8e3090163dd0c282dbc84f22',
          '028839757bba9bdf46ae553c124479e5c3ded609495f3e93e88ab23c0f559e8be5',
          '035c70ffb21d1b454ec650e511e76f6bd3fe76f49c471522ee187abac8d0131a18',
          '0234acd7dee22bc23688beed0c7e42c0930cfe024204b7298b0b59d0e76a464765'
        ],
        'network': 'testnet'
      },
      'configuration': null
    } })
    expect(address).to.deep.equal('tb1qn5mmecjkj4us6uhr5tc453k96hrzcwr3l9d8fkc7fg8zwur50y4qfdclp7')
  })

  it('parsing address with four ancoring keys and main network', () => {
    const address = Provider.parseConfigAddress({ services: {
      'btc_anchoring': {
        'public_keys': [
          '031cf96b4fef362af7d86ee6c7159fa89485730dac8e3090163dd0c282dbc84f22',
          '028839757bba9bdf46ae553c124479e5c3ded609495f3e93e88ab23c0f559e8be5',
          '035c70ffb21d1b454ec650e511e76f6bd3fe76f49c471522ee187abac8d0131a18',
          '0234acd7dee22bc23688beed0c7e42c0930cfe024204b7298b0b59d0e76a464765'
        ],
        'network': 'main'
      },
      'configuration': null
    } })
    expect(address).to.deep.equal('bc1qn5mmecjkj4us6uhr5tc453k96hrzcwr3l9d8fkc7fg8zwur50y4q79wsm3')
  })

  it('parsing address with 3 ancoring keys and testnet network', () => {
    const address = Provider.parseConfigAddress({ services: {
      'btc_anchoring': {
        'public_keys': [
          '031cf96b4fef362af7d86ee6c7159fa89485730dac8e3090163dd0c282dbc84f22',
          '028839757bba9bdf46ae553c124479e5c3ded609495f3e93e88ab23c0f559e8be5',
          '035c70ffb21d1b454ec650e511e76f6bd3fe76f49c471522ee187abac8d0131a18'
        ],
        'network': 'testnet'
      },
      'configuration': null
    } })
    expect(address).to.deep.equal('tb1qgguxfcutp0g7rwmkgeg5am9jvlq3uamlqges00fq5tm65vxhvwlsnyn2v9')
  })

  it('parsing address with 3 ancoring keys and main network', () => {
    const address = Provider.parseConfigAddress({ services: {
      'btc_anchoring': {
        'public_keys': [
          '031cf96b4fef362af7d86ee6c7159fa89485730dac8e3090163dd0c282dbc84f22',
          '028839757bba9bdf46ae553c124479e5c3ded609495f3e93e88ab23c0f559e8be5',
          '035c70ffb21d1b454ec650e511e76f6bd3fe76f49c471522ee187abac8d0131a18'
        ],
        'network': 'main'
      },
      'configuration': null
    } })
    expect(address).to.deep.equal('bc1qgguxfcutp0g7rwmkgeg5am9jvlq3uamlqges00fq5tm65vxhvwlsyv99k2')
  })
})
