import 'babel-polyfill'
import express from 'express'
import debug from 'debug'
import practitionerLocations from './practitioner-locations/routes'
import organizationLocations from './organization-locations/routes'
import coordinates from './coordinates/routes'
const dbg = debug('app:practitioner-locations')
const app = express()

process.on('unhandledRejection', (err)=>{
  dbg('unhandled-rejection: %o', err)
  process.exit(1)
})

app.get('/', (req, res)=>{
  res.send('api home...')
})

app.use('/practitioner-locations', practitionerLocations)
app.use('/organization-locations', organizationLocations)
app.use('/coordinates', coordinates)
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
  dbg(err.stack)
  res.status(500).send(`error: ${err}`)
})

const port = 3000
app.listen(port, ()=>{
  dbg('listening on port=%o', port)
})
