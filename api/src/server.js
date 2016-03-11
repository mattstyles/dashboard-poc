
import Koa from 'koa'
import logger from './utils/logger'
import EVENTS from './events'
import def from './utils/default'
import connect from './utils/connect'

import events from './services/events'
import BatteryEvent from './models/batteryEvent'

import router from './routes'

const PORT = def( 'PORT', 14320 )

const app = new Koa()

/**
 * Middleware
 */
app.use( logger.attach() )
app.use( logger.attachRequest() )

/**
 * Routes
 */
app.use( router.routes() )

/**
 * Events
 */
app.on( EVENTS.get( 'ERROR' ), logger.error )


/**
 * Starts up the services with the supplied connection
 * @param connection <TcpConnection> socket connected to rethinkdb
 * @returns <Promise> resolves when all services are connected
 */
function startServices( connection ) {
  logger.info( 'Establishing Service Connections' )

  // We only have the one service source at the moment
  return Promise.all([
    events.connect({
      connection: connection
    })
  ])
}


/**
 * Connects services and starts the server listening when all is ready
 */
export default function start() {
  // Establish connection
  connect()
    .then( startServices )
    .then( services => {
      app.emit( EVENTS.get( 'READY' ) )

      app.listen( PORT, () => {
        logger.info( `API listening on ${ PORT } ` )

        // setTimeout( () => {
        //   events.receive( new BatteryEvent({
        //     id: 'yo yo yo',
        //     ts: Date.now(),
        //     level: 20
        //   }))
        // }, 500 )

      })
    })
    .catch( err => {
      logger.error( 'Error starting API process' )
      logger.error( err )
      throw new Error( err )
    })
}
