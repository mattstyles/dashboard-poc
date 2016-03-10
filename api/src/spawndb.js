
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import osenv from 'osenv'

const DBPATH = path.join( osenv.home(), process.env.npm_package_config_db_path )
const LOGPATH = path.join( osenv.home(), process.env.npm_package_config_db_logpath )

export default function spawndb( dbpath = DBPATH, logtype ) {
  mkdirp.sync( dbpath )

  let out = process.stdout
  let err = process.stderr

  if ( logtype !== 'inline' ) {
    mkdirp.sync( LOGPATH )
    out = fs.openSync( path.join( LOGPATH, `${ Date.now() }.out.log` ), 'a' )
    err = fs.openSync( path.join( LOGPATH, `${ Date.now() }.err.log` ), 'a' )
  }

  const db = spawn( 'rethinkdb', [
    '-d', dbpath
  ], {
    stdio: [
      'ignore',
      out,
      err
    ]
  })

  return () => {
    db.kill()
  }
}
