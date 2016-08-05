import _ from 'lodash'
import assert from 'assert'
import debug from 'debug'
import {getDb} from '../db'
import constants from '../shared/constants'
import {isSet} from '../shared/express-helper'
const dbg = debug('app:practitioner-locations:data')

const collectionName = 'cmsProviderLocationsView'

export async function index(opts={}) {
  dbg('index: opts=%o', opts)
  const db = await getDb()
  const query = getQuery(opts)
  const sort = _.reduce(
    opts.sort ? (Array.isArray(opts.sort) ? opts.sort : [opts.sort]) : [],
    (result, value)=>{
      // prepend 'doc' here to operate on embedded 'doc' field used in conjunction with $$ROOT below
      if (value.startsWith('-')) {
        result[`doc.${value.substring(1)}`] = -1
      } else {
        result[`doc.${value}`] = 1
      }
      return result
    },
    {}
  )

  dbg('sort=%o', sort)

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
      {$sort: {'client.id': 1}},
      {
        $group: {
          _id: '$npi',
          // see: https://docs.mongodb.com/manual/reference/aggregation-variables/#variable.ROOT
          doc: {$last: '$$ROOT'}
        }
      },
      {$sort: {'doc.distance': 1}},
      {$skip: skip},
      {$limit: limit}
    ]
  )
  :
  collection.aggregate(
    [
      {$match: query},
      {$sort: {'client.id': 1}},
      {
        $group: {
          _id: '$npi',
          doc: {$last: '$$ROOT'}
        }
      },
      {$sort: sort},
      {$skip: skip},
      {$limit: limit}
    ]
  )

  const result = await cursor.toArray()
  return result.map((elt) => {
    return {...elt.doc}
  })
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
  const clientId = _.get(opts, 'client.id')
  // if client.id is not set, only return public data (where client.id = null)
  opts['client.id'] = clientId ? (isSet(opts.includeOutOfNetwork) ? [clientId, null] : clientId) : null

  return _.transform(
    opts,
    (result, value, key)=>{
      if (!['skip', 'limit', 'nearLat', 'nearLon', 'nearMiles', 'sort', 'includeOutOfNetwork'].includes(key)) {
        if (Array.isArray(value)) {
          value = {$in: value}
        } else if (_.isString(value) && value.startsWith('/')) {
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
