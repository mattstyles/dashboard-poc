
# Dashboard

> Dashboard POC monorepo

## Getting Started

```
npm start
```

The start script will install the app dependencies and fire up the server using the default configuration, which means it will be listening on port **8989**.

Once the server is running there is also a convenience script that can seed the database.

```
npm run seed
```

## Pre-requisites

* [Node version 5.8](https://nodejs.org/dist/v5.8.0/node-v5.8.0.pkg)
* [Rethinkdb version 2.2](https://www.rethinkdb.com/docs/install/)
* Chrome or Firefox

Tested against OSX 10.11.

Chrome/Firefox are required as the client that ships with app uses the [fetch api](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) and is currently unpolyfilled.

## Detailed - App

The bulk of the project is contained within the `app` folder.

The project assumes that `rethinkdb` is running with its defaults, and will fire it up as such, however, configuration can be made. Configuration lives in the `package.json`, the `app` package will accept config for the path and port of the rethinkdb database instance to use as well as which port the server should attempt to connect to.

`Rethinkdb` will spawn as part of the `npm start` script but this is only a convenience. Moving towards production and this convenience should be dropped or automated. The application will also accept configuration via environment variables which should help the transition from development to deployment via an app container (such as [docker](https://www.docker.com/) or [rkt](https://coreos.com/rkt/)).

### Hacking

The application contains a convenience watcher which will restart the project on save, it works best if the database process is started and it can just connect to it. Run the following in their own shells and you’ll be clear to start hacking

```
npm run start-db
```

```
npm run dev
```

## Decoupling

For brevity, as this is a POC, the client code is minimal. Babel does run over the JS but the client does not have its own specified build. Moving forward and this concern needs to be addressed, as does the specifics of the templating that generates the HTML.

The application exposes a RESTful API so a totally decoupled client is easy enough to hack in, although creating an isomorphic application using something like [React](https://facebook.github.io/react/) would also be an attractive idea.

## Test

```
npm test
```

Tests and a coverage report are yet to be written.
