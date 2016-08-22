import express from 'express'
import debug from 'debug'
import _ from 'lodash'
import geocode from 'geocodr'
import {getIndex, getMeta, getZipCoordinates} from './data'
import {dbgreq, isSet} from './express-helper'
import {isZip} from './helper'

const dbg = debug('app:shared:get-router')

export default function(opts) {
  const router = express.Router()
  const index = getIndex(opts)
  const meta = getMeta(opts)

  router.get('/', async (req, res, next)=>{
    try {
      dbgreq(dbg, req)
      const opts = await getOpts(req)
      const promises = (isSet(req.query.includeCount)) ? [index(opts), meta(opts)] : [index(opts)]
      const results = await Promise.all(promises)
      res.set('x-total-count', _.get(results[1], 'count'))
      res.send(results[0])
    } catch (err) {
      next(err)
    }
  })

  router.get('/meta', async (req, res, next)=>{
    try {
      dbgreq(dbg, req)
      const result = await meta(await getOpts(req))
      res.send(result)
    } catch (err) {
      next(err)
    }
  })

  return router
}

async function getOpts(req) {
  const opts = _.transform(
    req.query,
    (result, value, key)=>{
      if (['skip', 'limit', 'nearMiles'].includes(key)) {
        result[key] = parseInt(value)
      } else if (['nearLat', 'nearLon'].includes(key)) {
        result[key] = parseFloat(value)
      } else if (!['includeCount', 'nearAddress'].includes(key)) {
        result[key] = value
      }
    },
    {}
  )
  const {nearAddress} = req.query
  if (nearAddress) {
    let coordinates = isZip(nearAddress) && await getZipCoordinates(nearAddress)
    if (!coordinates) {
      coordinates = await geocode(nearAddress)
    }
    opts.nearLon = coordinates[0]
    opts.nearLat = coordinates[1]
  }
  return opts
}
