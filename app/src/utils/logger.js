
/**
 * App wide log instance
 */

import Logger from 'koa-bunyan-log'
import pkg from '../../package.json'

export default new Logger({
  name: pkg.name
})
