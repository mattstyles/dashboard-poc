

import Router from 'koa-router'

import eventsPost from './events/post'
import getData from './events/get'

var router = new Router()


router.post( '/event', eventsPost )
router.get( '/month/:year/:month', getData )




export default router
