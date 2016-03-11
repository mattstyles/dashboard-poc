
import parse from 'co-body'
import events from '../../services/events'
import BatteryEvent from '../../models/batteryEvent'

export default async ctx => {
  var body = await parse( ctx )
  var res = null

  try {
    console.log( body )
    await events.receive( new BatteryEvent( body ) )
  } catch( err ) {
    ctx.status = 500
    ctx.body = {
      status: 500,
      message: 'Error registering new event',
      verbose: err
    }

    return
  }

  ctx.status = 200
  ctx.body = {
    status: 200,
    message: 'OK'
  }
}
