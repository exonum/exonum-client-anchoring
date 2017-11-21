const btTxs = require('./blocktrail/transactions.json')

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
  return allBlocks.filter(item => Number(item.height) >= from && Number(item.height) < latest)
}

export const getTxs = (limit, page, skip = 0) => ({
  data: btTxs.slice(skip + limit * (page - 1), skip + limit * page)
})

export const getFullBlock = height => fullBlocks[height]

export const getExonumTx = hash => transactions[hash]

export const getFullBlockInvalid = height => fullBlocksInvalid[height]

export const getExonumTxInvalid = height => transactionsInvalid[height]
