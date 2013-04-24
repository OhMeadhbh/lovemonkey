module.exports = function( app, name, f ) {
  var url = require('url');
  var nar = require('nodify-approute');

  var _ = f._;
  var g = f.properties;
  var a = f.properties.apps[ name ];
  var dao = f.dao;

  var options = {
    routes: [
      {
        route: '/',
        get: function( body, params, callback ) {
          callback( {success: true} );
        }
      }
    ]
  };

  nar.createInstance( options ).init( function( _f ) {
    app.use( "/api", _f );
  } );
};