import express from 'express'
import debug from 'debug'
import assert from 'assert'
import geocode from 'geocodr'

const dbg = debug('app:geocode:routes')
const router = express.Router()

router.get('/', (req, res)=>{
  dbg('get: req.query=%o', req.query)
  assert(req.query.address)

  geocode(req.query.address).then((coordinates)=>{
    res.send(coordinates)
  })
})

export default router
