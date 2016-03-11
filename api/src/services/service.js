
import r from 'rethinkdb'

import logger from '../utils/logger'
import connect from '../utils/connect'
import def from '../utils/default'
import pkg from '../../package.json'
import CONFIG from '../config'


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

  _setup = connection => {
    return new Promise( ( resolve, reject ) => {

      this.logger.info( 'Service setup' )
      resolve()

    })

  }

  /**
   * Creates a thunk to attempt a databse connection when one is not
   * supplied to this.connect
   * @param host <String> the host to connect to
   * @param port <Number> the port to attempt connection to
   * @returns <Function> a thunk that returns a promise attempting
   *   to make a connection
   */
  _connectRethink( host, port ) {
    return function() {
      return connect( host, port )
    }
  }

  connect( options ) {
    return new Promise( ( resolve, reject ) => {

      var done = function() {
        resolve( this )
      }.bind( this )

      if ( !this.tableID ) {
        throw new Error( 'Trying to instantiate abstract class' )
      }

      let opts = Object.assign({
        connection: null,
        host: CONFIG.get( 'RETHINK_HOST' ),
        port: CONFIG.get( 'RETHINK_PORT' )
      }, options )

      let start = opts.connection
        ? () => Promise.resolve( opts.connection )
        : this._connectRethink( opts.host, opts.port )

      start()
        .then( this._setup )
        .then( done )
        .catch( reject )
    })
  }
}
