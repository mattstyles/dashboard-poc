
import minimist from 'minimist'
import spawndb from './spawndb'

const args = minimist( process.argv.slice( 2 ) )

if ( args.spawn ) {
  let stop = spawndb( process.env.DBPATH || undefined, args.spawn )
}
