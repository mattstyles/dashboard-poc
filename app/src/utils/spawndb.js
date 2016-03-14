
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import osenv from 'osenv'
import Logger from 'koa-bunyan-log'

const logger = new Logger({
  name: 'dashboard-db-spawn'
})

const DBPATH = path.join( osenv.home(), process.env.npm_package_config_db_path || 'dashboard-api' )
const LOGPATH = path.join( osenv.home(), process.env.npm_package_config_db_logpath || 'logs' )
const CONNECTION_TIMEOUT = 10000

/**
 * Creates a read stream
 * @param filepath <String>
 */
function createStream( filepath ) {
  let file = fs.openSync( filepath, 'a' )
  return fs.createWriteStream( filepath )
}

/**
 * Spawn function
 * @param dbpath <String> physical location of server files
 */
export default function spawndb( dbpath = DBPATH ) {
  mkdirp.sync( dbpath )

  // In debug mode just punt output to the parent shell, this could get
  // messy so in other environments pipe to log files.
  let out = process.stdout
  let err = process.stderr

  if ( process.env.NODE_ENV !== 'dev' ) {
    logger.info( `Sending DB logs to ${ LOGPATH }` )
    mkdirp.sync( LOGPATH )
    out = createStream( path.join( LOGPATH, `${ Date.now() }.out.log` ) )
    err = createStream( path.join( LOGPATH, `${ Date.now() }.err.log` ))
  }

  // Spawn a rethinkdb process using the specified directory
  const db = spawn( 'rethinkdb', [
    '-d', dbpath
  ], {
    stdio: [
      'ignore',
      'pipe',
      'pipe'
    ]
  })

  // Just pipe errors through to the parent to handle
  db.on( 'error', error => {
    db.emit( error )
  })

  // Add a timer to ensure that our server ready event is firing correctly,
  // throw an error if there is an issue connecting.
  // let connectionTimeout = setTimeout( () => {
  //   db.emit( 'error', new Error( 'Can not verify DB server has started' ) )
  // }, CONNECTION_TIMEOUT )


  db.stdout.on( 'data', data => {
    // Test for when the server is ready, this is brittle but its only
    // for development/testing. We'll give it 10 seconds and throw an
    // error if there is a problem reading that the server is ready.
    if ( /^server\sready/i.test( data.toString() ) ) {
      // clearTimeout( connectionTimeout )
      logger.info( 'Spawned Database Server Ready' )
      // db.emit( 'ready' )
    }

    out.write( `${ data }`)
  })

  db.stderr.on( 'data', data => {
    err.write( `${ data }` )
  })

  return db
}
