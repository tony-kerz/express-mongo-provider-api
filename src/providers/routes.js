import express from 'express'
import debug from 'debug'
import _ from 'lodash'
import {index} from './data'
import geocode from '../geocode'

const dbg = debug('app:provider:routes')
const router = express.Router()

// /providers?nearAddress={some address}&nearMiles=10

router.get('/', (req, res)=>{
  dbg('get: req.query=%o', req.query)

  getOpts(req).then((opts)=>{
    index(opts).then((result)=>{
      res.send(result)
    })
  })
})

async function getOpts(req) {
  const opts = _.transform(
    req.query,
    async (result, value, key)=>{
      dbg('get-opts: result=%o, value=%o, key=%o', result, value, key)
      if (['skip', 'limit', 'nearMiles'].includes(key)) {
        result[key] = parseInt(value)
      } else {
        result[key] = value
      }
    },
    {}
  )
  const {nearAddress} = req.query
  if (nearAddress) {
    opts.nearCoordinates = await geocode(nearAddress)
    delete opts.nearAddress
  }
  return opts
}

export default router
