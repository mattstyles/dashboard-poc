
import minimist from 'minimist'
import spawndb from './utils/spawndb'
import logger from './utils/logger'
import app from './server'
import EVENTS from './events'

const args = minimist( process.argv.slice( 2 ) )

if ( args.spawn ) {
  logger.info( 'Spawning db instance' )

  if ( process.env.NODE_ENV === 'debug' ) {
    logger.warn( 'DB is logging to stdout' )
  }

  spawndb( process.env.DBPATH || undefined, args.spawn )
}

const PORT = process.env.PORT || process.env.npm_package_config_port || 14320

app.on( EVENTS.get( 'READY' ), () => {
  app.listen( PORT, () => {
    logger.info( `Listening on ${ PORT } ` )
  })
})
