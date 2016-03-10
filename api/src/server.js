
import Koa from 'koa'
import logger from './utils/logger'
import EVENTS from './events'

const app = new Koa()

/**
 * Middleware
 */
app.use( logger.attach() )
app.use( logger.attachRequest() )

app.on( EVENTS.get( 'ERROR' ), logger.error )

setTimeout( () => {
  app.emit( EVENTS.get( 'READY' ) )
})

export default app
