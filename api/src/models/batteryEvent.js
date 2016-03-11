
/**
 * Create a constructor and use instanceof to pass around
 * battery low events.
 * @TODO there could be performance implications with registering many
 * events, but avoid premature optimisation and go with it for now.
 */


export default class BatteryEvent {
  constructor( event={} ) {
    /**
     * Percentage battery remaining
     */
    this.level = event.level || 100

    /**
     * Timestamp when the event is sent (not received)
     */
    this.ts = event.ts || Date.now()

    /**
     * sender id
     */
    this.id = event.id || 'unidentified'
  }
}
