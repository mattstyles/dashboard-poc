
import Koa from 'koa'
import logger from './utils/logger'
import EVENTS from './events'
import def from './utils/default'
import connect from './utils/connect'

import Service from './services/service'

const PORT = def( 'PORT', 14320 )

const app = new Koa()

/**
 * Middleware
 */
app.use( logger.attach() )
app.use( logger.attachRequest() )

app.on( EVENTS.get( 'ERROR' ), logger.error )


/**
 * Starts up the services with the supplied connection
 * @param connection <TcpConnection> socket connected to rethinkdb
 * @returns <Promise> resolves when all services are connected
 */
function startServices( connection ) {
  logger.info( 'Establishing Service Connections' )

  // dummy service
  let serv = new Service()
  serv.tableID = 'test'

  return Promise.all([
    serv.connect({
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
      })
    })
    .catch( err => {
      logger.error( 'Error starting API process' )
      logger.error( err )
      throw new Error( err )
    })
}
