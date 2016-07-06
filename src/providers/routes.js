import express from 'express'
import debug from 'debug'
import _ from 'lodash'
import {lookup, index} from './data'

const dbg = debug('app:provider:routes')
const router = express.Router()

router.get('/lookup', (req, res)=>{
  dbg('get: req.query=%o', req.query)
  lookup(getQuery(req), getOpts(req))
  .then((providers)=>{
    res.send(providers)
  })
})

router.get('/', (req, res)=>{
  dbg('get: req.query=%o', req.query)
  index(getQuery(req), getOpts(req))
  .then((providers)=>{
    res.send(providers)
  })
})

function getOpts(req) {
  return _.reduce(
    req.query,
    (result, value, key)=>{
      if (['skip', 'limit'].includes(key)) {
        result[key] = parseInt(value)
      }
      return result
    },
    {}
  )
}

function getQuery(req) {
  return _.reduce(
    req.query,
    (result, value, key)=>{
      if (!['skip', 'limit'].includes(key)) {
        result[key] = value
      }
      return result
    },
    {}
  )
}

export default router
