const btTxs = require('./blocktrail/transactions.json')

export const cfg1 = require('./exonum/configs-1.json')
const blocks = require('./exonum/blocks.json')
const fullBlocks = require('./exonum/fullBlocks.json')

export const getBlocks = (from, count) => {
  const to = from + count
  return blocks.filter(item => Number(item.height) > from && Number(item.height) < to)
}

export const getTxs = (limit, page) => ({ data: btTxs.slice(limit * (page - 1), limit * page) })

export const getFullBlock = height => fullBlocks[height]
