
import minimist from 'minimist'
import spawndb from './utils/spawndb'
import logger from './utils/logger'
import def from './utils/default'
import start from './server'

const args = minimist( process.argv.slice( 2 ) )

logger.info( 'Starting API Process' )

function spawnStart() {
  logger.info( 'Spawning db instance' )

  if ( process.env.NODE_ENV === 'debug' ) {
    logger.warn( 'DB is logging to stdout' )
  }

  let db = spawndb( process.env.DBPATH || undefined )

  db.on( 'error', err => {
    logger.error( err )
    db.kill()
    process.exit( 1 )
  })

  db.on( 'ready', () => {
    start()
  })
}

// Switch on the spawned or regular starts
args.spawn ? spawnStart() : start()
