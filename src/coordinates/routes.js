import express from 'express'
import debug from 'debug'
import assert from 'assert'
import geocode from 'geocodr'
import {dbgreq} from '../shared/express-helper'

const dbg = debug('app:geocode:routes')
const router = express.Router()

router.get('/', (req, res)=>{
  dbgreq(dbg, req)
  assert(req.query.address)

  geocode(req.query.address).then((coordinates)=>{
    res.send(coordinates)
  })
})

router.get('/zips', (req, res)=>{
  dbgreq(dbg, req)
  res.send('[zips]')
})

router.get('/:address', (req, res)=>{
  dbgreq(dbg, req)
  assert(req.params.address)

  geocode(req.params.address).then((coordinates)=>{
    res.send(coordinates)
  })
})

export default router
