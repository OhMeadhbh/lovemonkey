var templates;
var seed;

var dash_model = {
  lovesyou: [
    {
      id: "03bad4ee-a315-4931-b001-40d15580a48b",
      from: "@OhMeadhbh",
      to: "@OhMeadhbh",
      when: "12:45PM 04/23/2013",
      why: "Test Love"
    },
    {
      id: "526b49dc-fd44-4b6a-8c78-a8a177631eeb",
      from: "@elviscosity",
      to: "@OhMeadhbh",
      when: "12:44PM 04/23/2013",
      why: "for doing the initial (though slightly crappy) layout for the lovemonkey."
    },
    {
      id: "f7b07dd0-8400-4c4d-806b-2cb62a2bc758",
      from: "root@example.com",
      to: "OhMeadhbh@gmail.com",
      when: "12:43PM 04/23/2013",
      why: "For remembering to use example.com for your examples (instead of the borked lovemonkey address)"
    },
    {
      id: "cb8f6507-d183-4ae1-8004-9c529b1790e1",
      from: "random@example.com",
      to: "Meadhbh Hamrick",
      when: "12:42PM 04/23/2013",
      why: "For making love monkey work with twitter before making it work with facebook."
    }
  ],
  youlove: [
    {
      id: "03bad4ee-a315-4931-b001-40d15580a48b",
      from: "@OhMeadhbh",
      to: "@OhMeadhbh",
      when: "12:45PM 04/23/2013",
      why: "Test Love"
    }
  ]
};

function render( loc ) {
  if( ! loc ) { loc = location.hash.substr(1); }
  var items = loc.split('/').slice(1);

  console.log( items );
  if( 0 === items.length ) { return templates.render("/"); }

  switch( items[0] ) {
  case 'about':
    templates.render( '/' + items.join("/") );
    break;

  case 'love':
    if( ( items.length > 1 ) && ( "" !== items[1] ) ){
      console.log( 'render love ' + items[1] );
      templates.render( '/love' );
    } else {
      console.log( 'love not found' );
    }
    break;

  case 'dashboard':
    if( "" === seed.value ){
      templates.render( "/login" );
    } else {
      templates.render( "/dashboard", dash_model );
    }
    break;

  case 'logout':
    console.log( 'logging out...' );
    break;

  default:
    if( templates.items[ loc ] ) {
      templates.render( loc );
    } else {
      templates.render("/");
    }
  }

}

$(document).ready ( function () {
  (new _$Cookie( 'seed', 'whatever', new Date( Date.now() + 1000 * 60 * 60 ) ) ).set();
  templates = new _$Templates( '/templates', '#contents', 'json' );
  templates.init( postTemplate );
	
  function postTemplate ( err ) {
    if( err ) { return err.raise(); }
    seed = new _$Cookie( 'seed' ).get();
    render();
    $(window).on( 'hashchange', function( event ) {
      render();
    } );

  }

} );

( function () {
  function _$Cookie( name, value, expires ) {
    this.name = name;
    this.value = value?value:"";
    this.expires = expires;
  }

  _$Cookie.prototype.get = function () {
    var items = document.cookie.split('; ');
    for( var i = 0, il = items.length; i < il; i++ ) {
      var tmp = items[i].split('=');
      if( tmp[0] == this.name) {
        this.value = decodeURIComponent( tmp[1] );
        break;
      }
    }
    return this;
  };

  _$Cookie.prototype.set = function() {
    var cookie_string = encodeURIComponent(this.name) + '=' + encodeURIComponent(this.value) + "; path=/";

    if( this.expires ) {
      cookie_string += "; expires=" + (new Date(this.expires)).toUTCString();
    }

    document.cookie=cookie_string;
    return this;
  };

  _$Cookie.prototype.del = function() {
    document.cookie = this.name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  };

  window._$Cookie = _$Cookie;
} ) ();


function _cookie_delete( name ) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}



( function () {
  function _$Templates( url, target, type ) {
    this.endpoint = new _$Endpoint( url );
    this.target = $(target);
    this.type = type ? type : 'xml';
    this.items = {};
  }

  _$Templates.prototype.init = function( _complete ) {
    var that = this;

    this.endpoint.get( _post_get, this.type ); 

    function _post_get( err, data ) {
      if( err ) { return _complete( err ); }
      that.items = data;
      _complete( null );
    }
  };

  _$Templates.prototype.render = function ( fragment, data ) {
    var template = this.items[ fragment ];

    if( data ) {
      template = ( Handlebars.compile( template ) ) ( data );
      console.log( data );
    }

    template && this.target.html( template );
  };

  window._$Templates = _$Templates;
} ) ();

( function () {
  function _$Error( text, errno, severity, url ) {
    this.text = text;
    this.errno = errno;
    this.severity = severity;
    this.url = url;
    this.success = false;
  }

  window._$Error = _$Error;

  _$Error.prototype.toString = function() {
    return ( "%" + this.severity + ( this.errno ? "(" + this.errno + ")" : '' ) + '; ' + ( this.text ? this.text : '' ) );
  };

  _$Error.prototype.toHTML = function() {
    var output = ( this.text ? this.text : '' ) + ( this.errno ? ' (' + this.errno + ')' : '' );
    if( this.url ) {
      output = '<a href="' + this.url + '">' + output + '</a>';
    }
    return output;
  };

  _$Error.prototype._severity = function ( s ) {
    var i = s ? s : ( this.severity ? this.severity : 'info' );
    return i.substr(0,1).toUpperCase() + i.substr(1);
  };

  _$Error.prototype.raise = function () {
    $('#alert').html( '<div class="alert alert-' + ( this.severity ? this.severity : 'info' ) + '">' +
                      '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                      '<strong>' + this._severity() + '!</strong> ' + this.toHTML() + '</div>' );
  };

} ) ();

( function () {
  function _$Endpoint( url, parent, expires ) {
    this.url = url;
    this.parent = parent;
    this.expires = expires;
    _$Endpoint.endpoints[ this.url ] = this;
  }

  _$Endpoint.endpoints = {};

  _$Endpoint.query = function( url, method, body, complete, dataType ) {
    $.ajax( {
      context: this,
      url: url,
      async: true,
      contentType: ( body ? 'application/json' : undefined ),
      dataType: ( dataType ? dataType : 'json' ),
      type: method.toUpperCase(),
      timeout: 10000,
      success: function( data, textStatus, jqXHR ) {
        complete( null, data );
      },
      error: function ( jqXHR, textStatus, errorThrown ) {
        var e = new _$Error( 'I got a "' + errorThrown + '" when trying to ' + method.toUpperCase() + ' ' + this.url, null, textStatus );
        console.log( e.toString() );
        complete( e, null );
      }
    } );
  };

  _$Endpoint.get = function( url, complete, dataType ) {
    _$Endpoint.query( url, 'GET', null, complete, dataType );
  };

  _$Endpoint.post = function( url, body, complete, dataType ) {
    _$Endpoint.query( url, 'POST', body, complete, dataType );
  };

  _$Endpoint.put = function( url, body, complete, dataType ) {
    _$Endpoint.query( url, 'PUT', body, complete, dataType );
  };

  _$Endpoint.del = function( url, complete, dataType ) {
    _$Endpoint.query( url, 'DELETE', complete, dataType );
  };

  _$Endpoint.prototype.get = function( complete, dataType ) {
    _$Endpoint.get( this.url, complete, dataType );
  };

  _$Endpoint.prototype.post = function( body, complete, dataType ) {
    _$Endpoint.post( this.url, body, complete, dataType );
  };

  _$Endpoint.prototype.put = function( body, complete, dataType ) {
    _$Endpoint.put( this.url, body, complete, dataType );
  };

  _$Endpoint.prototype.del = function( complete, dataType ) {
    _$Endpoint.del( this.url, complete, dataType );
  };

  window._$Endpoint = _$Endpoint;

} ) ();
