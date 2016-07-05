import express from 'express'
import debug from 'debug'
import {index} from './data'

const dbg = debug('app:provider:routes')
const router = express.Router()

router.get('/', (req, res)=>{
  dbg('get: req.query=%o', req.query)
  index(
    {
      skip: parseInt(req.query.skip),
      limit: parseInt(req.query.limit)
    }
  ).then((providers)=>{
    res.send(providers)
  })
})

export default router
