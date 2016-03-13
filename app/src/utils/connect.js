
/**
 * Polls for a connection to the database, times out after
 * a few failed attempts
 */

import r from 'rethinkdb'

import logger from './logger'
import CONFIG from '../config'

const MAX_POLL_RETRY = 5
const RETRY_TIMEOUT = 1000

export default function connect( host=CONFIG.get( 'RETHINK_HOST' ), port=CONFIG.get( 'RETHINK_PORT' ) ) {
  return new Promise( ( resolve, reject ) => {
    function poll( count ) {
      logger.info( 'Attempting rethinkdb connection.', `Attempt ${ count }.` )
      r.connect({
        host: host,
        port: port
      }, ( err, connection ) => {
        if ( err && count >= MAX_POLL_RETRY ) {
          logger.error( 'Maximum connection retry attempts reached, aborting.' )
          reject( err )
          return
        }

        if ( err ) {
          logger.warn( 'Can not connect to rethinkdb, retrying...' )
          setTimeout( () => {
            poll( ++count )
          }, RETRY_TIMEOUT )
          return
        }

        logger.info( 'Connection successful to', `${ host }:${ port }` )
        resolve( connection )
      })
    }

    // Start polling
    poll( 0 )
  })
}
