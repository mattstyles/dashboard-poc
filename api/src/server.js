
import path from 'path'

import co from 'co'
import Koa from 'koa'
import convert from 'koa-convert'
import serve from 'koa-static'
import views from 'koa-views'
import { timeParse, timeFormat } from 'd3-time-format'

import logger from './utils/logger'
import EVENTS from './events'
import def from './utils/default'
import connect from './utils/connect'

import events from './services/events'
import BatteryEvent from './models/batteryEvent'

import router from './routes'

const PORT = def( 'PORT', 14320 )
const EXPIRY = 1000 * 60 * 60 * 24 * 30

const format = time => {
  time = timeParse( '%Y-%m' )( time )
  return timeFormat( '%B %Y' )( time )
}

const app = new Koa()

/**
 * Middleware
 */
app.use( logger.attach() )
app.use( logger.attachRequest() )

/**
 * Routes
 */

app.use( convert( views( path.join( __dirname, 'tmpl' ), {
  map: {
    hjs: 'hogan'
  }
})))



app.use( router.routes() )

app.use( convert( serve( path.join( __dirname, 'public' ), {
  maxage: process.env.NODE_ENV === 'production' ? EXPIRY : 0
})))

// Index
app.use( async ( ctx, next ) => {
  ctx.render = co.wrap( ctx.render.bind( ctx ) )

  // Grab initial data and populate view
  let data = await events.getAll()

  // Map keys to human-readable, push to an array and render template
  let mapped = data.reduce( ( prev, current ) => {
    let days = []
    Object.keys( current.days ).forEach( day => {
      days.push( current.days[ day ] )
    })
    current.days = days
    current.id = format( current.id )
    prev.push( current )
    return prev
  }, [] )
  ctx.logger.info( 'Using data', mapped )
  await ctx.render( 'index.hjs', {
    data: mapped
  })
})

/**
 * Events
 */
app.on( EVENTS.get( 'ERROR' ), logger.error )


/**
 * Starts up the services with the supplied connection
 * @param connection <TcpConnection> socket connected to rethinkdb
 * @returns <Promise> resolves when all services are connected
 */
function startServices( connection ) {
  logger.info( 'Establishing Service Connections' )

  // We only have the one service source at the moment
  return Promise.all([
    events.connect({
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
