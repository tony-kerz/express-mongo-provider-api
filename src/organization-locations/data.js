import _ from 'lodash'
import assert from 'assert'
import debug from 'debug'
import {getDb} from '../db'
import constants from '../shared/constants'

const dbg = debug('app:organization-locations:data')

const collectionName = 'npiOrganizationLocationsView'

export async function index(opts={}) {
  dbg('index: opts=%o', opts)
  const db = await getDb()
  const query = getQuery(opts)
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

  const collection = db.collection(collectionName)
  const coordinates = getCoordinates(opts)
  const skip = opts.skip || 0
  const limit = opts.limit || 10
  const cursor = coordinates ?
  collection.aggregate(
    [
      {
        $geoNear: {
          near: {type: 'Point', coordinates},
          distanceField: 'distance',
          maxDistance: (opts.nearMiles || 10)/constants.mileToMeterMultiplier,
          query,
          spherical: true,
          distanceMultiplier: constants.mileToMeterMultiplier
        }
      },
      {$skip: skip},
      {$limit: limit}
    ]
  )
  :
  collection.find(query).sort(sort).skip(skip).limit(limit)

  return await cursor.toArray()
}

export async function meta(opts={}) {
  dbg('meta: opts=%o', opts)
  const db = await getDb()
  const query = getQuery(opts)
  const collection = db.collection(collectionName)
  const coordinates = getCoordinates(opts)
  const countCursor = coordinates ?
  collection.find({
    ...query,
    geoPoint: {
      $near: {
        $geometry: {type: 'Point', coordinates},
        $maxDistance: (opts.nearMiles || 10)/constants.mileToMeterMultiplier
      }
    }
  })
  :
  collection.find(query)

  const count = await countCursor.count()

  return {count}
}

function getQuery(opts) {
  return _.transform(
    opts,
    (result, value, key)=>{
      if (!['skip', 'limit', 'nearLat', 'nearLon', 'nearMiles', 'sort'].includes(key)) {
        if (Array.isArray(value)) {
          value = {$in: value}
        } else if (value.startsWith('/')) {
          const toks = value.split('/').filter((val)=>{return val != ''})
          assert(toks[0])
          value = {$regex: toks[0], $options: toks[1] || ''}
        }
        result[key] = value
      }
    },
    {}
  )
}

function getCoordinates(opts) {
  return (opts.nearLat && opts.nearLon) ? [opts.nearLon, opts.nearLat] : null
}
