
import r from 'rethinkdb'

import logger from '../utils/logger'
import def from '../utils/default'
import pkg from '../../package.json'


// Static db connection constants
const DB_PORT = def( 'DB_PORT', 28015 )
const DB_HOST = def( 'DB_HOST', '0.0.0.0' )
const DB_ID = def( 'DB_ID', pkg.name )

/**
 * Abstract Service Class
 */
export default class Service {
  constructor( options ) {
    let opts = Object.assign({
      logger: logger
    }, options )

    this.tableID = null
    this.logger = opts.logger
  }

  _setup( connection ) {
    return new Promise( ( resolve, reject ) => {

      console.log( '_setup' )
      console.log( 'connected' )
      this.logger.info( 'connected' )
      resolve()  

    })

  }

  _connectRethink( host, port ) {
    return new Promise( ( resolve, reject ) => {

      r.connect({
        host: host,
        port: port
      }, ( err, connection ) => {
        if ( err ) {
          this.logger.error( 'Error connecting to rethinkdb' )
          this.logger.error( err )
          reject( err )
          return
        }

        resolve( connection )
      })

    })
  }

  connect( options ) {
    return new Promise( ( resolve, reject ) => {

      if ( !this.tableID ) {
        throw new Error( 'Trying to instantiate abstract class' )
      }

      let opts = Object.assign({
        connection: null,
        host: DB_HOST,
        port: DB_PORT
      }, options )

      let start = opts.connection
        ? Promise.resolve( opts.connection )
        : this._connectRethink( opts.host, opts.port )

      start
        .then( this._setup )
        .then( resolve )
        .then( reject )

    })
  }


}
