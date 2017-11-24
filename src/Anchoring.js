import Provider from './Provider'
import Events from './Events'
import * as store from './store/'
import { _, blockHash, to, status, merkleRootHash } from './common/'
import { verifyBlock, stringToUint8Array, hash } from 'exonum-client'

const INITIALIZED = 'initialized'
const LOADED = 'loaded'
const STOPPED = 'stopped'
const SYNCHRONIZED = 'synchronized'
const ERROR = 'error'

function Anchoring (params) {
  const constructor = () => {
    Events.apply(this, arguments)
    const config = Object.assign({ cache: true, syncTimeout: 120 }, params)
    _(this).hash = configToHash(config)
    const { provider, driver, cache, syncTimeout } = config

    _(this).provider = new Provider(provider)
    _(this).driver = driver
    _(this).sync = true
    _(this).syncTimeout = syncTimeout

    initSync(cache)
  }

  const initSync = async cache => {
    const initParams = { anchorTxs: [], anchorHeight: 0, address: 0, page: 1, anchorsLoaded: false }
    let data = {}
    if (cache) {
      let err
      [data, err] = await to(store.load(_(this).hash))
      if (err) _(this).dispatch(ERROR, err)
    }

    const { anchorTxs, anchorHeight, address, page, anchorsLoaded } = Object.assign(initParams, data)
    _(this).anchorTxs = anchorTxs
    _(this).anchorHeight = anchorHeight
    _(this).address = address
    _(this).page = page
    _(this).anchorsLoaded = anchorsLoaded
    _(this).dispatch(INITIALIZED, this.getStatus())
    syncAnchorTransaction()
  }

  const getAnchorTx = height => {
    if (_(this).anchorHeight >= height) {
      return _(this).anchorTxs.find(item => item[3] >= height)
    }
  }

  const getAnchorTxAsync = height => {
    return new Promise(resolve => {
      const anchor = getAnchorTx(height)
      if (anchor) resolve(anchor)
      if (_(this).anchorsLoaded) resolve(null)

      const onLoaded = () => {
        const anchor = getAnchorTx(height)
        if (anchor) {
          this.off(LOADED, onLoaded)
          this.off(SYNCHRONIZED, onSync)
          resolve(anchor)
        }
      }
      this.on(LOADED, onLoaded)

      const onSync = () => {
        const anchor = getAnchorTx(height)
        this.off(LOADED, onLoaded)
        this.off(SYNCHRONIZED, onSync)
        anchor ? resolve(anchor) : resolve(null)
      }
      this.on(SYNCHRONIZED, onSync)
    })
  }

  const syncAnchorTransaction = async () => {
    if (!_(this).sync) return
    await getAllAnchorTransaction().catch(err => _(this).dispatch(ERROR, err))
    setTimeout(() => syncAnchorTransaction(), _(this).syncTimeout * 1000)
  }

  this.blockStatus = async inHeight => {
    if (!_(this).sync) return false
    const height = Number(inHeight)
    if (isNaN(height)) throw new TypeError(`Height ${inHeight} is invalid number`)
    const { validatorKeys, frequency } = await _(this).provider.getConfigForBlock(height)
    const block = await _(this).provider.getBlock(height)
    if (block === null) return status.block(0)

    const blockValid = verifyBlock(block, validatorKeys, block.precommits[0].network_id)
    if (!blockValid) return status.block(1, { block })

    const anchorTx = await getAnchorTxAsync(height)
    if (anchorTx && anchorTx[3] === height) {
      const proof = { anchorTx, block }
      if (anchorTx[4] !== blockHash(block.block)) return status.block(3, proof)
      return status.block(11, proof)
    }
    const { blocks, errors, chainValid } = await _(this).provider.getBlocks(height, anchorTx ? anchorTx[3] : height + frequency, blockHash(block.block))
    const proof = { errors, block, blocks, anchorTx }

    if (!chainValid) return status.block(2, proof)
    if (!anchorTx) return status.block(10, proof)
    if (anchorTx[4] !== blockHash(blocks[blocks.length - 1])) return status.block(3, proof)
    return status.block(11, proof)
  }

  this.txStatus = async (txHash) => {
    if (!_(this).sync) return false
    const tx = await _(this).provider.getTx(txHash)
    if (tx.type === 'MemPool') return status.transaction(9, { tx })
    const rootHash = merkleRootHash(tx.proof_to_block_merkle_root)

    const block = await this.blockStatus(tx.location.block_height)
    const proof = { block, tx }

    if (block.status <= 3) return status.transaction(block.status, proof)

    if (block.proof.block.block.tx_hash === rootHash) { return status.transaction(block.status, proof) }

    return status.transaction(5, proof)
  }

  this.getStatus = () => {
    const { sync, anchorsLoaded } = _(this)
    const { anchorHeight, anchorTxs } = getState()
    return { anchorHeight, anchorTxs, anchorsLoaded, sync }
  }

  this.syncStop = () => {
    _(this).sync = false
    if (_(this).anchorsLoaded) _(this).dispatch(STOPPED, this.getStatus())
  }

  const getAllAnchorTransaction = async () => {
    const configsCommited = await _(this).provider.getConfigsCommited()
    const addresses = configsCommited.map(item => item.address)
    _(this).anchorsLoaded = false
    for (_(this).address; _(this).address < addresses.length; _(this).address++) {
      const address = addresses[_(this).address]
      for (_(this).page; ; _(this).page++) {
        const { txs, hasMore } = await _(this).driver._getAddressTransactions(address, _(this).page)
        const filteredTxs = txs.filter(item => Number(item[3]) > _(this).anchorHeight)
        _(this).anchorTxs = [..._(this).anchorTxs, ...filteredTxs]
        if (filteredTxs.length > 0) {
          _(this).anchorHeight = Number(filteredTxs[filteredTxs.length - 1][3])
          _(this).dispatch(LOADED, this.getStatus())
        }
        await safeState()
        if (!hasMore || !_(this).sync) break
      }
      if (!_(this).sync) break
    }
    if (_(this).sync) {
      _(this).dispatch(SYNCHRONIZED, this.getStatus())
      _(this).anchorsLoaded = new Date()
    } else {
      _(this).dispatch(STOPPED, this.getStatus())
    }
    _(this).address--
  }

  const configToHash = config => {
    let buffer = []
    for (let node of config.provider.nodes) {
      buffer = [...buffer, ...stringToUint8Array(node)]
    }
    return hash(buffer)
  }

  const getState = () => {
    const { address, page, anchorTxs, anchorHeight } = _(this)
    return { address, page, anchorHeight, anchorTxs }
  }

  const safeState = async () => {
    const [save, err] = await to(store.save(getState(), _(this).hash))
    if (err) _(this).dispatch(ERROR, err)
    return save
  }
  constructor()
}

Anchoring.prototype = Object.create(Events.prototype)
export default Anchoring
