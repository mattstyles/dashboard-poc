
import parse from 'co-body'
import events from '../../services/events'
import BatteryEvent from '../../models/batteryEvent'

export default async ctx => {
  var res = null

  try {
    console.log( ctx.params )
    let keyFormat = `${ ctx.params.year }-${ ctx.params.month }`
    res = await events.getMonth( keyFormat )
  } catch( err ) {
    ctx.status = 500
    ctx.body = {
      status: 500,
      message: 'Error getting month data',
      verbose: err
    }

    return
  }

  if ( !res ) {
    ctx.status = 404
    ctx.body = {
      status: 404,
      message: 'Not found'
    }
    return
  }

  console.log( res )

  ctx.status = 200
  ctx.body = {
    status: 200,
    message: res
  }
}
