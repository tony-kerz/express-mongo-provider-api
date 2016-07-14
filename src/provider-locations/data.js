import debug from 'debug'
import _ from 'lodash'
import assert from 'assert'
import {getDb} from '../db'
import Timer from '../timer'

const dbg = debug('app:provider-locations:data')
const mileToMeterMultiplier = 0.00062137

export async function index(opts={}) {
  dbg('index: opts=%o', opts)

  const db = await getDb()

  const timer = new Timer('provider-geo')

  const query = _.transform(
    opts,
    (result, value, key)=>{
      if (!['skip', 'limit', 'nearCoordinates', 'nearMiles', 'sort'].includes(key)) {
        if (Array.isArray(value)) {
          value = {$in: value}
        } else if (value.startsWith('/')) {
          const toks = value.split('/').filter((val)=>{return val != ''})
          dbg('toks=%o', toks)
          assert(toks[0])
          value = {$regex: toks[0], $options: toks[1] || ''}
        }
        result[key] = value
      }
    },
    {}
  )

  dbg('index: query=%o', query)

  const sort = _.reduce(
    opts.sort ? (Array.isArray(opts.sort) ? opts.sort : [opts.sort]) : [],
    (result, value)=>{
      if (value.startsWith('-')) {
        result[value.substring(1)] = -1
      } else {
        result[value] = 1
      }
      return result
    },
    {}
  )

  dbg('index: sort=%o', sort)

  const collection = db.collection('cmsProviderLocationsView')

  const cursor = opts.nearCoordinates ?
  collection.aggregate(
    [
      {
        $geoNear: {
          near: {type: 'Point', coordinates: opts.nearCoordinates},
          distanceField: 'distance',
          maxDistance: (opts.nearMiles || 10)/mileToMeterMultiplier,
          query,
          spherical: true,
          distanceMultiplier: mileToMeterMultiplier
        }
      }
    ]
  )
  :
  collection.find(query)

  const result = await cursor
  .skip(opts.skip || 0)
  .limit(opts.limit || 10)
  .sort(sort)
  .toArray()

  timer.stop()
  dbg('timer=%o', timer.toString())
  return result
}
