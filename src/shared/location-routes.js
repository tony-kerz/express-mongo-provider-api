import express from 'express'
import debug from 'debug'
import _ from 'lodash'
import geocode from 'geocodr'
import {Index, Meta} from '../shared/location-data'
import {dbgreq} from '../shared/express-helper'

const dbg = debug('app:shared:location-routes')

export default function(collectionName) {
  const router = express.Router()

  const index = Index(collectionName)
  const meta = Meta(collectionName)

  router.get('/', async (req, res)=>{
    dbgreq(dbg, req)
    const opts = await getOpts(req)
    const promises = (parseInt(req.query.includeCount)) ? [index(opts), meta(opts)] : [index(opts)]
    const results = await Promise.all(promises)
    res.set('x-total-count', _.get(results[1], 'count'))
    res.send(results[0])
  })

  router.get('/meta', (req, res)=>{
    dbgreq(dbg, req)

    meta(getOpts(req)).then((result)=>{
      res.send(result)
    })
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
  if (req.query.nearAddress) {
    //const coordinates = await geocode(req.query.nearAddress, nominatim)
    const coordinates = await geocode(req.query.nearAddress)
    opts.nearLon = coordinates[0]
    opts.nearLat = coordinates[1]
  }
  return opts
}
