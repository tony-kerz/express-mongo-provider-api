import express from 'express'
import debug from 'debug'
import providers from './providers/routes'
const dbg = debug('app:provider-api')
const app = express()

process.on('unhandledRejection', (err)=>{
  dbg('unhandled-rejection: %o', err)
  process.exit(1)
})

app.get('/', (req, res)=>{
  res.send('api home...')
})

app.use('/providers', providers)

const port = 3000
app.listen(port, ()=>{
  dbg('listening on port=%o', port)
})
