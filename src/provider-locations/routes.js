import express from 'express'
import debug from 'debug'
import _ from 'lodash'
import {index, meta} from './data'

const dbg = debug('app:provider-locations:routes')
const router = express.Router()

router.get('/', (req, res)=>{
  dbg('index: req.query=%o', req.query)

  index(getOpts(req)).then((result)=>{
    res.send(result)
  })
})

router.get('/meta', (req, res)=>{
  dbg('meta: req.query=%o', req.query)

  meta(getOpts(req)).then((result)=>{
    res.send(result)
  })
})

function getOpts(req) {
  return _.transform(
    req.query,
    (result, value, key)=>{
      if (['skip', 'limit', 'nearMiles'].includes(key)) {
        result[key] = parseInt(value)
      } else if (['nearLat', 'nearLon'].includes(key)) {
        result[key] = parseFloat(value)
      } else {
        result[key] = value
      }
    },
    {}
  )
}

export default router
