

import Router from 'koa-router'

import eventsPost from './events/post'

var router = new Router()


router.post( '/event', eventsPost )




export default router
