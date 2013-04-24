// kickstart-http.js
//
// This is the skeletal app for the kickstart project. By default, we read the
// properties files specified in the command line, create a uuid generator and
// then add the stock endpoints.
//
// Remember to specify a properties file when you launch this app, like so:
//    node kickstart-http.js --config file://properties.json

var props   = require( 'node-props' );
var logger  = require( 'nodify-logger' );
var _       = require( 'underscore' );
var connect = require( 'connect' );
var fs      = require( 'fs' );
var templates = require( './src/connect_templates' );
var persist = require( 'nodify-persist' );

var g;
var l;
var SHIZZLE;
var apps = {};
var _aopts = {
  flags: "a+",
  encoding: "UTF-8",
  mode: 0666
};

var facilities = {
  logger: logger,
  _: _
};

read_props();

function read_props( ) {
  props.read( function( properties ) {
    g = facilities.properties = properties;

    log_init();
  } );
}

function log_init( ) {
  logger.createInstance( g.logger, function ( log_func, log_abbrev) {
    l = log_func;
    SHIZZLE = log_abbrev;

    l( SHIZZLE.I_LOGINI );

    dao_init();
  } );
}

function dao_init( ) {
  if( g.persist ) {
    var instance = new persist( g.persist );
    instance.init( function( err, target ) {
      facilities.dao = target;
      facilities.persist = instance;
      load_apps();
    } );
  }
}


function load_apps( ) {
  var apps_to_start = g.start || _.keys( g.apps );
  _.each( apps_to_start, function ( element, index, list ) {
    l( SHIZZLE.I_APPINI, element );
    var current = g.apps[ element ];
    var app = connect();

    if( current.favicon ) {
      app.use( connect.favicon( current.favicon.path ) );
    }

    app.use( connect.cookieParser() );

    if( current.access ) {
      if( current.access.path ) {
        current.access.stream = fs.createWriteStream( current.access.path, _aopts );
      }
      app.use( connect.logger( current.access ) );
    }

    if( current.source ) {
      require( current.source )( app, element, facilities );
    }

    if( current.template && current.template.path ) {
      app.use( '/templates', ( new templates( current.template.path ) ).middleware() );
    }

    if( current.static && current.static.path ) {
      app.use( connect.static( current.static.path, current.static ) );
    }

    app.use( function( err, req, res, next ) {
      var e = ( 'number' == typeof err ) ? err : err.status;
      var path = 'http://' + req.headers.host + req.url;
      var site_info = _build_site_info( current.info, req.headers.host.split(':')[0], req.headers.host );
      if( 404 == e ) {
        res.status( 404 );
        res.render( 'notfound', {site: site_info, path: path } );
      } else {
        res.status( 500 );
        res.render( 'error', {site: site_info, path: path, desc: err.stack } );
      }
    } );

    if( current.listen && current.listen.port ) {
      app.listen( current.listen.port, current.listen.host );
    }

    apps[ element ] = app;

  } );
}

function exuent_omnis( status ) {
  process.exit( status );
}

function _build_site_info( info, host, base ) {
  if( ! host ) {
    return info;
  }

  var rv = {};
  _.each( info, function ( value, key, list ) {
    switch( key ) {
    case 'title':
      rv.title = host;
      break;
    case 'base':
      rv.base = 'http://' + (base?base:host) + '/';
      break;
    default:
      rv[ key ] = value
    }
  } );

  return rv;
}
