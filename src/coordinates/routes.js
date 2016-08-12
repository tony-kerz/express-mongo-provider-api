import express from 'express'
import debug from 'debug'
import assert from 'assert'
import geocode from 'geocodr'
import {dbgreq} from '../shared/express-helper'

const dbg = debug('app:geocode:routes')
const router = express.Router()

router.get('/', async (req, res, next)=>{
  try {
    dbgreq(dbg, req)
    assert(req.query.address)

    const coordinates = await geocode(req.query.address)
    res.send(coordinates)
  } catch (err) {
    next(err)
  }
})

router.get('/zips', (req, res, next)=>{
  try {
    dbgreq(dbg, req)
    res.send('[zips]')
  } catch (err) {
    next(err)
  }
})

router.get('/:address', async (req, res, next)=>{
  try {
    dbgreq(dbg, req)
    assert(req.params.address)

    const coordinates = await geocode(req.params.address)
    res.send(coordinates)
  } catch (err) {
    next(err)
  }
})

export default router
