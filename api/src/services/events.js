
import r from 'rethinkdb'
import Logger from 'koa-bunyan-log'
import { timeFormat } from 'd3-time-format'

import Service from './service'
import BatteryEvent from '../models/batteryEvent'

// YYYY-mm-dd e.g. 2016-03-08
// mm [01,12]
// dd [01,31]
// const format = timeFormat( '%Y-%m-%d' )
const format = timeFormat( '%d' )

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
   * Expects key to be YYYY-mm
   */
  getMonth( key ) {
    // @TODO check key is the correct format

    return new Promise( ( resolve, reject ) => {
      this.data
        .get( key )
        .run( this.connection, ( err, month ) => {
          if ( err ) {
            this.logger.error( err )
            reject( err )
            return
          }

          resolve( month )
        })
    })
  }

  /**
   * Expects event to be a battery low event instance
   */
  receive( event ) {
    if ( !( event instanceof BatteryEvent ) ) {
      throw new Error( 'Invalid battery event model passed to battery service' )
    }

    // @TODO sanity check event validity

    // Grab date format from timestamp
    // @TODO creating date objects is potentially too slow, check ops
    let date = new Date( event.ts )
    let key = keyFormat( date )
    let row = format( date )

    this.logger.info( 'Battery low event received:', event )
    this.logger.info( key, row )

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
          let updatedRow = {
            days: {
              [ row ]: ++month.days[ row ] || 1
            }
          }

          let meta = {
            monthTotal: ++month.meta.monthTotal,
            numDays: month[ row ] ? month.meta.numDays : ++month.meta.numDays
          }

          meta.average = meta.monthTotal / meta.numDays

          // @TODO should periodically check the validity of the data

          this.data.get( key )
            .update( Object.assign( month, updatedRow, { meta } ) )
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
          days: {
            [ row ]: value
          },
          meta: {
            numDays: 1,
            monthTotal: value,
            average: value
          },
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
