
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

    /**
     * Connection ref to the db
     */
    this.connection = null

    /**
     * Refers to the connection to the specific db table for this service
     */
    this.data = null
  }

  /**
   * Gets or creates a new database within rethinkdb
   * @param conn <TcpConnection> Rethinkdb connection
   * @param id <String> database is to connect to
   */
  _getDB = ( conn, id ) => {
    if ( !conn ) {
      throw new Error( 'Attempting to access db before connection is ready' )
    }

    return new Promise( ( resolve, reject ) => {
      r.dbList().run( conn, ( listError, res ) => {
        if ( listError ) {
          this.logger.error( 'Error listing databases' )
          reject( err )
          return
        }

        if ( res.indexOf( id ) >= 0 ) {
          this.logger.info( 'Service connected to database' )
          resolve( r.db( id ) )
          return
        }

        this.logger.info( 'Creating new database:', id )

        r.dbCreate( id )
          .run( conn, createError => {
            if ( createError ) {
              this.logger.error( 'Error creating database:', id )
              reject( createError )
              return
            }

            this.logger.info( 'Database created successfully:', id )
            resolve( r.db( id ) )
          })
      })
    })
  }

  /**
   * Gets or creates a new table within the database
   * @param conn <TcpConnection> Rethinkdb connection
   * @param db <Rethink:DB> database connection
   * @param id <String> table is to get
   */
  _getTable = ( conn, db, id ) => {
    if ( !conn ) {
      throw new Error( 'Attempting to access table before connection is ready' )
    }

    if ( !db ) {
      throw new Error( 'Can not create table within unspecified database' )
    }

    return new Promise( ( resolve, reject ) => {
      db.tableList().run( conn, ( listError, res ) => {
        if ( listError ) {
          this.logger.error( 'Error listing tables' )
          reject( err )
          return
        }

        if ( res.indexOf( id ) >= 0 ) {
          this.logger.info( 'Service connected to data' )
          resolve( db.table( id ) )
          return
        }

        this.logger.info( 'Creating new table:', id )

        db.tableCreate( id )
          .run( conn, createError => {
            if ( createError ) {
              this.logger.error( 'Error creating table:', id )
              reject( createError )
              return
            }

            this.logger.info( 'Data table created successfully:', id )
            resolve( db.table( id ) )
          })
      })
    })
  }

  /**
   * Creates or connects to the table required by this service
   */
  _setup = connection => {
    return new Promise( ( resolve, reject ) => {

      this.connection = connection

      this._getDB( connection, CONFIG.get( 'DB_ID' ) )
        .then( db => {
          return this._getTable( connection, db, this.tableID )
        })
        .then( data => {
          // Store table connection
          this.data = data
        })
        .then( done => {
          this.logger.info( 'Service ready' )
          resolve()
        })
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

  /**
   * Creates a connection to the db table/s required by the service
   * @param options <Object>
   *   @param connection <TcpConnection> to rethinkdb
   *   @param host <String> to attempt a connection
   *   @param port <Number> port number to attempt connnection
   * @returns <Promise> resolves when the service is ready
   */
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
