import _ from 'lodash'
import assert from 'assert'
import debug from 'debug'
import {getDb} from './db'
const dbg = debug('app:shared:data')

const mileToMeterMultiplier = 0.00062137
const nearMilesDefault = 10

/*
generic functions to handle mongo queries consistently handling options including:
- skip, limit, sort, nearLat, nearLon, and nearMiles
*/

/**
@callback queryHook
@param  {Object} opts - options passed to routine (may contain stuff that will choke mongo)
@returns {Object} options object that can be used directly by a mongo query
*/

/**
@typedef {Object} GetMongoDataOpts
@property {string} collectionName - mongo collection name
@property {Object[]} [steps] - mongo aggregation steps
@property {string} [docField] - field name used when using $$ROOT syntax in $group
@property {queryHook} [queryHook] - transform options
*/

/**
@typedef {Object} MongoDataOpts
@property {Object} [sort]
@property {number} [nearLat] - lat to use for geo query
@property {number} [nearLon] - lon to use for geo query
@property {number} [nearMiles=10] - radius in miles to use for geo query
@property {number} [skip=0] - skip of skip/limit fame
@property {number} [limit=10] - limit of skip/limit fame
*/

/**
@callback MongoIndex
@param  {MongoDataOpts}
@returns {Object[]} mongo result set
*/

/**
@param {GetMongoDataOpts}
@returns {MongoIndex}
*/
export function getIndex({collectionName, steps=[], docField, queryHook}) {
  dbg('get-index: collection=%o', collectionName)
  return async function({sort, nearLat, nearLon, nearMiles=nearMilesDefault, skip=0, limit=10}) {
    dbg('index: args=%o', arguments[0])
    const db = await getDb()
    const query = getQuery({opts: arguments[0], queryHook})

    const collection = db.collection(collectionName)
    const coordinates = getCoordinates({nearLat, nearLon})

    let _steps = [...steps]
    !_.isEmpty(sort) && _steps.push({$sort: getSort({sort, prefix: docField})})
    _steps = _steps.concat([{$skip: skip}, {$limit: limit}])

    const cursor = coordinates ?
    collection.aggregate(
      [{
        $geoNear: {
          near: {type: 'Point', coordinates},
          distanceField: 'distance',
          maxDistance: nearMiles/mileToMeterMultiplier,
          query,
          spherical: true,
          distanceMultiplier: mileToMeterMultiplier
        }
      }].concat(_steps),
      {allowDiskUse: true}
    )
    :
    collection.aggregate(
      [{$match: query}].concat(_steps),
      {allowDiskUse: true}
    )

    const result = await cursor.toArray()
    return docField ? result.map((elt) => {
      return {...elt[docField]}
    }) : result
  }
}

/**
@typedef {Object} MetaResponse
@property {number} count number of documents meeting search criteria
*/

/**
@callback MongoMeta
@param  {MongoDataOpts}
@returns {MetaResponse}
*/

/**
@param {GetMongoDataOpts}
@returns {MongoMeta}
*/
export function getMeta({collectionName, steps, queryHook}) {
  dbg('get-meta: collection=%o', collectionName)
  return async function({nearLat, nearLon, nearMiles=nearMilesDefault}) {
    dbg('index: args=%o', arguments[0])
    const db = await getDb()
    const query = getQuery({opts: arguments[0], queryHook})
    const collection = db.collection(collectionName)
    const coordinates = getCoordinates({nearLat, nearLon})
    const _steps = steps.concat([{$group: {_id: null, count: {$sum: 1}}}])
    const countCursor = coordinates ?
    collection.aggregate(
      [{
        $geoNear: {
          near: {type: 'Point', coordinates},
          distanceField: 'distance',
          maxDistance: nearMiles/mileToMeterMultiplier,
          query,
          spherical: true,
          distanceMultiplier: mileToMeterMultiplier
        }
      }].concat(_steps),
      {allowDiskUse: true}
    )
    :
    collection.aggregate(
      [{$match: query}].concat(_steps),
      {allowDiskUse: true}
    )

    const result = await countCursor.toArray()
    assert(result.length === 1)
    dbg('get-meta: result=%o', result)
    return result[0]
  }
}

/**
@param {string} zip - string representing zip code
@returns {Array} array of form [lon, lat]
*/
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

/**
@param {Object} opts - options object
@param {queryHook} [queryHook]
@returns {Object} object suitable to specify mongo sort operation
*/
function getQuery({opts, queryHook}) {
  const _opts = queryHook ? queryHook({...opts}) : opts

  return _.transform(
    _opts,
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

/**
@param {(string|string[])} sort - fields to sort by potentially prefixed with "-" indicating descending sort
@param {string} [prefix] - optional prefix when fields are in parent
@returns {Object} object suitable to specify mongo sort operation
*/
function getSort({sort, prefix}) {
  const _prefix = prefix ? `${prefix}.` : ''
  const _sort = _.reduce(
    sort ? (Array.isArray(sort) ? sort : [sort]) : [],
    (result, value)=>{
      if (value.startsWith('-')) {
        result[`${_prefix}${value.substring(1)}`] = -1
      } else {
        result[`${_prefix}${value}`] = 1
      }
      return result
    },
    {}
  )
  dbg('get-sort: sort=%o, result=%o', sort, _sort)
  return _sort
}

/**
@param {number} nearLat - latitude coordinate
@param {number} nearLon - longitude coordinate
@returns {Array} array of form [lon, lat] or null
*/
function getCoordinates({nearLat, nearLon}) {
  return (nearLat && nearLon) ? [nearLon, nearLat] : null
}
