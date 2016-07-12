import express from 'express'
import debug from 'debug'
import _ from 'lodash'
import {index} from './data'
import geocode from '../geocode'

const dbg = debug('app:provider-locations:routes')
const router = express.Router()

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
    (result, value, key)=>{
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
