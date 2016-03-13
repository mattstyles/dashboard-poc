
const nav = document.querySelectorAll( '.js-navItem' )
const average = document.querySelector( '.js-average-value' )
const total = document.querySelector( '.js-total-value' )
const graph = document.querySelector( '.js-graph' )

const monthNames = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
}

function strip( elements ) {
  [].forEach.call( elements, el => {
    el.classList.remove( 'Nav-Item--isActive' )
  })
}

function onData( data ) {
  average.innerHTML = data.meta.average
  total.innerHTML = data.meta.monthTotal

  graph.innerHTML = ''
  Object.keys( data.days ).forEach( key => {
    let el = document.createElement( 'span' )
    el.classList.add( 'Graph-Item' )
    el.style.height = data.days[ key ] + 'px'
    graph.appendChild( el )
  })
}

[].forEach.call( nav, el => {
  el.addEventListener( 'click', event => {
    strip( nav )
    el.classList.add( 'Nav-Item--isActive' )

    let date = el.dataset.id.split( /\s/ )
    date[ 0 ] = monthNames[ date[ 0 ].toLowerCase() ]
    fetch( '/month/' + date[ 1 ] + '/' + date[ 0 ] )
      .then( res => res.json() )
      .then( data => onData( data.message ) )
      .catch( err => {
        console.error( 'Fetch error' )
        throw new Error( err )
      })
  })
})
