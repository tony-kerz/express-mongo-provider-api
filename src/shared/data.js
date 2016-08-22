import _ from 'lodash'
import assert from 'assert'
import debug from 'debug'
import {getDb} from './db'
const dbg = debug('app:shared:data')

const mileToMeterMultiplier = 0.00062137
/*
generic functions to handle mongo queries consistently handling options including:
- skip, limit, sort, nearLat, nearLon, and nearMiles
*/

/**
transform options object into something that can be used as mongo query
@callback optsHook
@param  {Object} opts - options passed to routine
@returns {Object} resultant opts
*/

/**
@typedef MongoQueryOpts
@type {Object}
@property {string} collectionName - mongo collection name
@property {Object[]} [steps] - mongo aggregation steps
@property {string} [docField] - field name used when using $$ROOT syntax in $group
@property {optsHook} [optsHook] - transform options
*/

/**
@param {MongoQueryOpts} outerOpts
@returns {Object[]} mongo result set
*/
export function getIndex(outerOpts) {
  dbg('get-index: opts=%o', outerOpts)
  return async function index(opts={}) {
    dbg('index: opts=%o', opts)
    const db = await getDb()
    const query = getQuery(outerOpts, opts)
    const prefix = outerOpts.docField ? `${outerOpts.docField}.` : ''
    const sort = _.reduce(
      opts.sort ? (Array.isArray(opts.sort) ? opts.sort : [opts.sort]) : [],
      (result, value)=>{
        // prepend 'doc' here to operate on embedded 'doc' field used in conjunction with $$ROOT below
        if (value.startsWith('-')) {
          result[`${prefix}${value.substring(1)}`] = -1
        } else {
          result[`${prefix}${value}`] = 1
        }
        return result
      },
      {}
    )

    const collection = db.collection(outerOpts.collectionName)
    const coordinates = getCoordinates(opts)
    const skip = opts.skip || 0
    const limit = opts.limit || 10
    dbg('sort=%o, coordinates=%o', sort, coordinates)
    let steps = outerOpts.steps || []
    !_.isEmpty(sort) && steps.push({$sort: sort})
    steps = steps.concat([{$skip: skip}, {$limit: limit}])

    const cursor = coordinates ?
    collection.aggregate(
      [{
        $geoNear: {
          near: {type: 'Point', coordinates},
          distanceField: 'distance',
          maxDistance: (opts.nearMiles || 10)/mileToMeterMultiplier,
          query,
          spherical: true,
          distanceMultiplier: mileToMeterMultiplier
        }
      }].concat(steps),
      {allowDiskUse: true}
    )
    :
    collection.aggregate(
      [{$match: query}].concat(steps),
      {allowDiskUse: true}
    )

    const result = await cursor.toArray()
    return outerOpts.docField ? result.map((elt) => {
      return {...elt[outerOpts.docField]}
    }) : result
  }
}

export function getMeta(outerOpts) {
  dbg('get-meta: opts=%o', outerOpts)
  return async function meta(opts={}) {
    dbg('meta: opts=%o', opts)
    const db = await getDb()
    const query = getQuery(outerOpts, opts)
    const collection = db.collection(outerOpts.collectionName)
    const coordinates = getCoordinates(opts)
    const countCursor = coordinates ?
    collection.find({
      ...query,
      geoPoint: {
        $near: {
          $geometry: {type: 'Point', coordinates},
          $maxDistance: (opts.nearMiles || 10)/mileToMeterMultiplier
        }
      }
    })
    :
    collection.find(query)

    const count = await countCursor.count()

    return {count}
  }
}

export async function getZipCoordinates(zip) {
  const db = await getDb()
  const result = await db.collection('geozip').find({zip}).toArray()
  dbg('get-zip-coordinates: result=%o', result)
  if (result.length > 1) {
    throw new Error(`unexpected result count=[${result.length}] for zip=[${zip}]`)
  } else if (result.length === 0) {
    return null
  } else {
    return [result[0].longitude, result[0].latitude]
  }
}

function getQuery(outerOpts, opts) {
  opts = outerOpts.optsHook ? outerOpts.optsHook({...opts}) : opts

  return _.transform(
    opts,
    (result, value, key)=>{
      if (!['skip', 'limit', 'sort', 'nearLat', 'nearLon', 'nearMiles'].includes(key)) {
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
