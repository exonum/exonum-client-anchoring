const btTxs = require('./blocktrail/transactions.json')

export const cfg1 = require('./exonum/configs-1.json')
export const cfg2 = require('./exonum/configs-2.json')
const blocks = require('./exonum/blocks.json')
const fullBlocks = require('./exonum/fullBlocks.json')

export const getBlocks = (latest, count) => {
  if (count > 1000) count = 1000
  const from = latest - count
  return blocks.filter(item => Number(item.height) >= from && Number(item.height) < latest)
}

export const getTxs = (limit, page, skip = 0) => ({
  data: btTxs.slice(skip + limit * (page - 1), skip + limit * page)
})

export const getFullBlock = height => fullBlocks[height]
