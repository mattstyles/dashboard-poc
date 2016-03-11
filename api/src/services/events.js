
import r from 'rethinkdb'
import Logger from 'koa-bunyan-log'
import { timeFormat } from 'd3-time-format'

import Service from './service'
import BatteryEvent from '../models/batteryEvent'

// YYYY-mm-dd e.g. 2016-03-08
// mm [01,12]
// dd [01,31]
const format = timeFormat( '%Y-%m-%d' )

// Data is stored by month
// Purely as an example of how it could be stored
const keyFormat = timeFormat( '%Y-%m' )

/**
 * Handles battery low events and punts them into daily buckets
 *
 * Ignores also sorting by device ID's
 */
class Events extends Service {
  constructor() {
    super({
      logger: new Logger({
        name: 'event-service'
      })
    })

    this.tableID = 'batteryLow'
  }

  /**
   * Expects event to be
   */
  receive( event ) {
    if ( !( event instanceof BatteryEvent ) ) {
      throw new Error( 'Invalid battery event model passed to battery service' )
    }

    // Grab date format from timestamp
    // @TODO creating date objects is potentially too slow, check ops
    let date = new Date( event.ts )
    let key = keyFormat( date )
    let row = format( date )

    this.logger.info( 'Battery low event received:', event )

    return new Promise( ( resolve, reject ) => {
      // Grab events on the existing day
      this.data
        .get( key )
        .run( this.connection, ( err, month ) => {
          if ( err ) {
            this.logger.error( err )
            reject( err )
            return
          }

          // Create a new month document if necessary
          if ( !month ) {
            this.insert( key, row, 1 )
              .then( resolve )
              .catch( reject )
            return
          }

          // Otherwise just update the count for the day
          this.data.get( key )
            .update( Object.assign( month, {
              [ row ]: ++month[ row ] || 1
            }))
            .run( this.connection, error => {
              if ( error ) {
                this.logger.error( error )
                reject( error )
                return
              }

              resolve()
            })
        })
    })

  }

  /**
   * Inserts a new month object
   */
  insert( key, row, value ) {
    return new Promise( ( resolve, reject ) => {
      this.data
        .insert({
          [ row ]: value,
          id: key
        })
        .run( this.connection, err => {
          if ( err ) {
            this.logger.error( err )
            reject( err )
            return
          }

          resolve()
        })
    })
  }

}


export default new Events()
