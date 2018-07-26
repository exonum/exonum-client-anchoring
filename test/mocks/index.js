const btTxs = require('./smartbit/transactions.json')
const blockCypherTxs = require('./blockcypher/transactions.json')

export const cfg1 = require('./exonum/configs-1.json')
export const cfg2 = require('./exonum/configs-2.json')
const blocks = require('./exonum/blocks.json')
const blocksHigh = require('./exonum/blocks-from1153k.json')
const fullBlocks = require('./exonum/fullBlocks.json')
const transactions = require('./exonum/transactions.json')

const fullBlocksInvalid = require('./exonum/fullBlocks-in.json')
const transactionsInvalid = require('./exonum/transactions-in.json')

const allBlocks = [...blocks, ...blocksHigh]
export const getBlocks = (latest, count) => {
  if (count > 1000) count = 1000
  const from = latest - count
  return { blocks: allBlocks.filter(item => Number(item.height) >= from && Number(item.height) < latest) }
}

export const getTxs = (pagesize, page, offset = 0) => {
  return { paging: btTxs[page].paging, op_returns: [...btTxs[page].op_returns].splice(offset, pagesize) }
}

export const getCrypherTxs = (pagesize, page, skip = 0) => ({
  txs: blockCypherTxs.slice(skip + pagesize * (page - 1), skip + pagesize * page)
})

export const getFullBlock = height => fullBlocks[height]

export const getExonumTx = hash => transactions[hash]

export const getFullBlockInvalid = height => fullBlocksInvalid[height]

export const getExonumTxInvalid = height => transactionsInvalid[height]
