#!/usr/bin/env node

'use strict'

var request = require( 'superagent' )
var argv = require( 'minimist' )( process.argv.slice( 2 ) )

const PORT = process.env.PORT || process.env.npm_package_config_port || 8989
const DAY = 1000 * 60 * 60 * 24
const NUM = argv.n || argv.num || 300

function generateID() {
  (((1 + Math.random() ) * 0x10000000 ) | 0).toString( 16 )
}

console.log( 'Seeding Database...' )

function sendEvent( ts, count ) {
  console.log( new Date( ts ) )
  request
    .post( `http://0.0.0.0:${ PORT }/event` )
    .set( 'Content-Type', 'application/json' )
    .set( 'Accept', 'application/json' )
    .send({
      level: 20 - ( Math.random() * 20 ) | 0,
      ts: ts,
      id: generateID()
    })
    .end( ( err, res ) => {
      if ( err ) {
        console.error( err )
        return
      }

      if ( count <= 0 ) {
        console.log( 'Done' )
        return
      }

      sendEvent( Math.random() > .75 ? ts - DAY : ts, --count )
    })
}

// Go go go
sendEvent( Date.now(), NUM )
