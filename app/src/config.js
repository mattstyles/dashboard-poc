
import toMap from 'to-map'
import pkg from '../package.json'
import def from './utils/default'

export default toMap({
  RETHINK_HOST: def( 'DB_HOST', '0.0.0.0' ),
  RETHINK_PORT: def( 'DB_PORT', 28015 ),
  DB_ID: def( 'DB_ID', pkg.name )
})
