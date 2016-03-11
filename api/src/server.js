
import Koa from 'koa'
import logger from './utils/logger'
import EVENTS from './events'
import def from './utils/default'

import Service from './services/service'

const PORT = def( 'PORT', 14320 )

let serv = new Service()
serv.tableID = 'test'
// serv.connect()
//   .then( () => {
//     logger.info( 'ready' )
//     app.emit( EVENTS.get( 'READY' ) )
//   })
//   .catch( err => {
//     logger.error( err )
//   })

const app = new Koa()

/**
 * Middleware
 */
app.use( logger.attach() )
app.use( logger.attachRequest() )

app.on( EVENTS.get( 'ERROR' ), logger.error )



export default function start() {
  logger.info( 'Establishing Service Connections' )

  // Mock connections
  setTimeout( () => {
    app.emit( EVENTS.get( 'READY' ) )
  }, 1000 )

  app.on( EVENTS.get( 'READY' ), () => {
    app.listen( PORT, () => {
      logger.info( `Listening on ${ PORT } ` )
    })
  })
}
