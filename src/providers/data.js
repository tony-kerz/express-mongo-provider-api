import debug from 'debug'
import _ from 'lodash'
import {getDb} from '../db'
import Timer from '../timer'

const dbg = debug('app:provider:data')
const mileToMeterMultiplier = 0.00062137

export async function index(opts={}) {
  dbg('index: opts=%o', opts)

  const db = await getDb()

  const timer = new Timer('provider-geo')

  const query = _.transform(
    opts,
    (result, value, key)=>{
      if (!['skip', 'limit', 'nearCoordinates', 'nearMiles'].includes(key)) {
        if (value.startsWith('/') && value.endsWith('/')) {
          value = new RegExp(value.slice(1, -1))
        }
        result[key] = value
      }
    },
    {}
  )

  const collection = db.collection('cmsDenormedProviderLocations')

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
  .toArray()

  timer.stop()
  dbg('timer=%o', timer.toString())
  return result
}
