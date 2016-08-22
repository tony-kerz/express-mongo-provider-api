import 'babel-polyfill'
import express from 'express'
import debug from 'debug'
import practitionerLocationsRouter from './locations/practitioner/router'
import organizationLocationsRouter from './locations/organization/router'
import coordinatesRouter from './coordinates/router'
import zipsRouter from './zips/router'
const dbg = debug('app:index')
const app = express()

process.on('unhandledRejection', (err)=>{
  dbg('unhandled-rejection: %o', err)
  process.exit(1)
})

app.get('/', (req, res)=>{
  res.send('api home...')
})

app.use('/practitioner-locations', practitionerLocationsRouter)
app.use('/organization-locations', organizationLocationsRouter)
app.use('/coordinates', coordinatesRouter)
app.use('/zips', zipsRouter)
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
  dbg(err.stack)
  res.status(500).send(`error: ${err}`)
})

const port = 3000
app.listen(port, ()=>{
  dbg('listening on port=%o', port)
})
