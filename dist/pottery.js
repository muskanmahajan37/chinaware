(function(root, undefined) {

  "use strict";


/* pottery main */

// Base function.
var Pottery = function() {
  // Add functionality here.
  return true;
};


// Version.
Pottery.VERSION = '0.0.0';


// Export to the root, which is probably `window`.
root.Pottery = Pottery;


/*     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
*     Underscore may be freely distributed under the MIT license.
*/

Pottery.isObject = function (obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

Pottery.isFunction = function(obj) {
    return typeof obj == 'function' || false;
};

Pottery.defaults = function(obj) {
    if (!Pottery.isObject(obj)) {
        return obj;
    }

    for (var i = 1, length = arguments.length; i < length; i++) {
        var source = arguments[i];
        for (var prop in source) {
            if (obj[prop] === void 0) {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
};

Pottery.extend = function (obj) {
    if (!Pottery.isObject(obj)) {
        return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            if (hasOwnProperty.call(source, prop)) {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
};


/**
 * Pottery Class 0.0.1
 * JavaScript Class built-in inheritance system
 *(c) 2015, Fengda Huang - http://www.phodal.com
 *
 * Copyright (c) 2011, 2012 Jeanine Adkisson.
 *  MIT Licensed.
 * Inspired by https://github.com/munro/self, https://github.com/jneen/pjs
 */

Pottery.prototype.Class = (function (prototype, ownProperty) {

	var PotteryClass = function Klass(_superclass, definition) {

        function Class() {
            var self = this instanceof Class ? this : new Basic();
            self.init.apply(self, arguments);
            return self;
        }

        function Basic() {
        }

        Class.Basic = Basic;

        var _super = Basic[prototype] = _superclass[prototype];
        var proto = Basic[prototype] = Class[prototype] = new Basic();

        proto.constructor = Class;

        Class.extend = function (def) {
            return new Klass(Class, def);
        };

        var open = (Class.open = function (def) {
            if (Pottery.isFunction(def)) {
                def = def.call(Class, proto, _super, Class, _superclass);
            }

            if (Pottery.isObject(def)) {
                for (var key in def) {
                    if (ownProperty.call(def, key)) {
                        proto[key] = def[key];
                    }
                }
            }

            if (!('init' in proto)) {
                proto.init = _superclass;
            }

            return Class;
        });

        return (open)(definition);
    };

    return PotteryClass;

})('prototype', ({}).hasOwnProperty);


Pottery.get = function (url, callback) {
    Pottery.send(url, 'GET', callback);
};

Pottery.load = function (url, callback) {
    Pottery.send(url, 'GET', callback);
};

Pottery.post = function (url, data, callback) {
    Pottery.send(url, 'POST', callback, data);
};

Pottery.send = function (url, method, callback, data) {
    data = data || null;
    var request = new XMLHttpRequest();
    if (callback instanceof Function) {
        request.onreadystatechange = function () {
            if (request.readyState === 4 && (request.status === 200 || request.status === 0)) {
                callback(request.responseText);
            }
        };
    }
    request.open(method, url, true);
    if (data instanceof Object) {
        data = JSON.stringify(data);
        request.setRequestHeader('Content-Type', 'application/json');
    }
    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    request.send(data);
};


var Event = {
    on: function(event, callback){
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    },
    off: function(event, callback){
        this._events = this._events || {};
        if (event in this._events === false) {
            return;
        }
        this._events[event].splice(this._events[event].indexOf(callback), 1);
    },
    trigger: function(event){
        this._events = this._events || {};
        if (event in this._events === false) {
            return;
        }
        for (var i = 0; i < this._events[event].length; i++) {
            this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }
};

var event = {
    Event: Event
};


Pottery.prototype = Pottery.extend(Pottery.prototype, event);


/*
 * JavaScript Templates 2.4.1
 * https://github.com/blueimp/JavaScript-Templates
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Inspired by John Resig's JavaScript Micro-Templating:
 * http://ejohn.org/blog/javascript-micro-templating/
 */

/*jslint evil: true, regexp: true, unparam: true */

var Template = {
    regexp: /([\s'\\])(?!(?:[^{]|\{(?!%))*%\})|(?:\{%(=|#)([\s\S]+?)%\})|(\{%)|(%\})/g,
    encReg: /[<>&"'\x00]/g,
    encMap: {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "\"": "&quot;",
        "'": "&#39;"
    },
    arg: "o",
    helper: ",print=function(s,e){_s+=e?(s==null?'':s):_e(s);}" +
    ",include=function(s,d){_s+=tmpl(s,d);}",

    tmpl: function (str, data){
        var f = !/[^\w\-\.:]/.test(str) ? "" : this.compile(str);
        return f(data, this);
    },

    compile: function (str) {
        var fn, variable;
        variable = this.arg + ',tmpl';
        fn = "var _e=tmpl.encode" + this.helper + ",_s='" + str.replace(this.regexp, this.func) + "';";
        fn = fn + "return _s;";
        return new Function(variable, fn);
    },

    encode: function (s) {
        /*jshint eqnull:true */
	    var encodeRegex = /[<>&"'\x00]/g,
            encodeMap = {
                "<": "&lt;",
                ">": "&gt;",
                "&": "&amp;",
                "\"": "&quot;",
                "'": "&#39;"
            };
        return (s == null ? "" : "" + s).replace(
            encodeRegex,
            function (c) {
                return encodeMap[c] || "";
            }
        );
    },

    func: function (s, p1, p2, p3, p4, p5) {
        var specialCharMAP = {
            "\n": "\\n",
            "\r": "\\r",
            "\t": "\\t",
            " ": " "
        };

        if (p1) { // whitespace, quote and backspace in HTML context
            return specialCharMAP[p1] || "\\" + p1;
        }
        if (p2) { // interpolation: {%=prop%}, or unescaped: {%#prop%}
            if (p2 === "=") {
                return "'+_e(" + p3 + ")+'";
            }
            return "'+(" + p3 + "==null?'':" + p3 + ")+'";
        }
        if (p4) { // evaluation start tag: {%
            return "';";
        }
        if (p5) { // evaluation end tag: %}
            return "_s+='";
        }
    }
};

var template = {
    Template: Template
};

Pottery.prototype = Pottery.extend(Pottery.prototype, template);


var FX = {
    easing: {
        linear: function(progress) {
            return progress;
        },
        quadratic: function(progress) {
            return Math.pow(progress, 2);
        },
        swing: function(progress) {
            return 0.5 - Math.cos(progress * Math.PI) / 2;
        },
        circ: function(progress) {
            return 1 - Math.sin(Math.acos(progress));
        },
        back: function(progress, x) {
            return Math.pow(progress, 2) * ((x + 1) * progress - x);
        },
        bounce: function(progress) {
            for (var a = 0, b = 1; 1; a += b, b /= 2) {
                if (progress >= (7 - 4 * a) / 11) {
                    return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
                }
            }
        },
        elastic: function(progress, x) {
            return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * x / 3 * progress);
        }
    },
    animate: function(options) {
        var start = new Date();
        var id = setInterval(function() {
            var timePassed = new Date() - start;
            var progress = timePassed / options.duration;
            if (progress > 1) {
                progress = 1;
            }
            options.progress = progress;
            var delta = options.delta(progress);
            options.step(delta);
            if (progress == 1) {
                clearInterval(id);
                options.complete();
            }
        }, options.delay || 10);
    },
    fadeOut: function(element, options) {
        var to = 1;
        this.animate({
            duration: options.duration,
            delta: function(progress) {
                progress = this.progress;
                return FX.easing.swing(progress);
            },
            complete: options.complete,
            step: function(delta) {
                element.style.opacity = to - delta;
            }
        });
    },
    fadeIn: function(element, options) {
        var to = 0;
        this.animate({
            duration: options.duration,
            delta: function(progress) {
                progress = this.progress;
                return FX.easing.swing(progress);
            },
            complete: options.complete,
            step: function(delta) {
                element.style.opacity = to + delta;
            }
        });
    }
};

var fx = {
    FX: FX
};

Pottery.prototype = Pottery.extend(Pottery.prototype, fx);


/*jshint camelcase: false */

function _addEventListener(element, type,listener,useCapture){
  if(element.addEventListener){
    element.addEventListener(type, listener, useCapture);
  }else if(element.attachEvent){
    element.attachEvent("on" + type, listener);
  }
}


function overlay(x, y, w, h) {
  var div = root.document.createElement('div'),
    s = div.style;
  s.top = y + 'px';
  s.left = x + 'px';
  s.width = w + 'px';
  s.height = h + 'px';
  s.color = '#fff';
  s.zIndex = 100;
  s.position = 'absolute';
  s.backgroundColor = '#000';
  s.opacity = 0.7;
  return div;
}


function loadImages(images, callback) {
  var img,src,sjs, i, toLoad = 0, total, div;
  var doc = root.document;
  var h = 480;
  var w = 480;
  var error = false;

  sjs = {
    spriteCache: {}
  };

  div = overlay(0, 0, w, h);
  div.style.textAlign = 'center';
  div.style.paddingTop = (h / 2 - 16) + 'px';

  div.innerHTML = 'Loading';
  window.document.body.appendChild(div);

  for (i = 0; i < images.length; i++) {
    if (!sjs.spriteCache[images[i]]) {
      toLoad += 1;
      sjs.spriteCache[images[i]] = {src: images[i], loaded: false, loading: false};
    }
  }

  total = toLoad;
  var _loadImg = function(src) {
    sjs.spriteCache[src].loading = true;
    img = doc.createElement('img');
    sjs.spriteCache[src].img = img;
    _addEventListener(img, 'load', function () {
      sjs.spriteCache[src].loaded = true;
      toLoad -= 1;
      if (error === false) {
        if (toLoad === 0) {
          //window.document.removeChild(div);
          callback();
        } else {
          div.innerHTML = 'Loading ' + ((total - toLoad) / total * 100 | 0) + '%';
        }
      }
    }, false);

    _addEventListener(img, 'error', function () {
      error = true;
      div.innerHTML = 'Error loading image ' + src;
    }, false);

    img.src = src;
  };

  for (src in sjs.spriteCache) {
    if (sjs.spriteCache.hasOwnProperty(src)) {
      if (!sjs.spriteCache[src].loading) {
        _loadImg(src);
      }
    }
  }
}


var MAPS_DIR = 'maps/';

var Tiled = function(url){
  this.tileLayers = [];
  this.MapObj = [];
  this.url = url;
  this.tileProperties = [];
  this.playerStart = {};
  this.activeObjects = [];
  this.collisionObjects = [];

  this.load = function() {
    var self = this;
    Pottery.get(self.url, function(data){
      self.buildMap(JSON.parse(data));
    });
  };

  this._getGid = function(x, y) {
    var index,
      self = this;
    if (x < 0 || y < 0 || x >= self.MapObj.width || y >= self.MapObj.height) {
      return;
    }
    index = x + y * this.width;
    return this.data[index];
  };

  this.buildMap = function(parsedMap) {
    var layer,
      images = [],
      i,
      self =this,
      that =this;

    var MapObj = parsedMap;

    for (i = 0; i < MapObj.layers.length; i += 1) {
      layer = MapObj.layers[i];

      if (layer.type === 'tilelayer') {
        layer.getGid = self._getGid;
        self.tileLayers.push(layer);
      } else if (layer.type === 'objectgroup') {
        // map editor [Tiled] will output polygon coordinates in relative space to a fixed x,y
        function makePolygon(object) {

          var points = [],
            i;

          if (object.polygon || object.polyline) {
            if (object.polygon) {
              points = object.polygon;
            } else {
              points = object.polyline;
            }

            // iterate through each x,y coordinate pair and convert from relative to absolute
            for (i = 0; i < points.length; i += 1) {
              points[i].x = object.x + points[i].x;
              points[i].y = object.y + points[i].y;
            }
          } else {
            // object is a rectangle but only top left is defined; build it from width and height
            points = [
              {'x': object.x, 'y': object.y},
              {'x': object.x + object.width, 'y': object.y},
              {'x': object.x + object.width, 'y': object.y + object.height},
              {'x': object.x, 'y': object.y + object.height}
            ];
          }

          return points;
        }

        function buildMapObjects(layer) {

          var object, shape,
            teleportIDs = [],
            i;

          for (i = 0; i < layer.objects.length; i += 1) {
            object = layer.objects[i];

            if (layer.hasOwnProperty('properties') && layer.properties.type === 'collision') {
              shape = makePolygon(object);
              that.collisionObjects.push(shape);
            } else {
              switch (object.type) {
                case 'player_start':
                  that.playerStart.x = object.x;
                  that.playerStart.y = object.y;
                  break;
                case 'teleport_to':
                  shape = {
                    'type': 'teleport_to',
                    'map': object.properties.map,
                    'to_id': object.properties.id,
                    'polygon': makePolygon(object)
                  };
                  that.activeObjects.push(shape);
                  break;
                case 'teleport_from':
                  teleportIDs[object.properties.id] = {
                    'x': object.x,
                    'y': object.y
                  };
                  break;
                case 'dialog':
                  shape = {
                    'type': 'dialog',
                    'dialog': object.properties,
                    'polygon': makePolygon(object)
                  };
                  that.activeObjects.push(shape);
                  break;
                case 'entity':
                  // right now this is just a pig but needs to be converted to anything
                  shape = {
                    'type': 'entity',
                    'gid': object.gid,
                    'properties': object.properties,
                    'polygon': makePolygon(object)
                  };
                  that.activeObjects.push(shape);
                  break;
              } // end switch
            } // end if/else
          } // end for

          // when a start position is passed in, use it instead of built-in player start
          // this is typically if not always from a teleport scenario
          if (that.startPositionID !== undefined && teleportIDs[that.startPositionID] !== undefined) {
            that.playerStart = teleportIDs[that.startPositionID];
          }
          if (that.playerStart.length === 0) {
            that.playerStart = {
              'x': 0,
              'y': 0
            };
          }
        } // end buildObjectMap()
        buildMapObjects(layer);
      }
    }

    function buildTileProperties() {

      var i,
        prop, tileset;

      for (i = 0; i < MapObj.tilesets.length; i += 1) {
        tileset = MapObj.tilesets[i];

        for (prop in tileset.tileproperties) {
          if (tileset.tileproperties.hasOwnProperty(prop)) {
            // parseInt takes a radix (here and typically it will be base10)
            self.tileProperties[parseInt(prop, 10) + tileset.firstgid] = tileset.tileproperties[prop];
          }
        }
      }
    }

    buildTileProperties();

    for (i = 0; i < MapObj.tilesets.length; i += 1) {
      images.push(MAPS_DIR + MapObj.tilesets[i].image);
    }

    console.log(images, self.tileProperties, self.activeObjects);
    loadImages(images, function(){
      console.log("finish");
    });
  };
};

var tiled = {
  Tiled: Tiled
};

Pottery.prototype = Pottery.extend(Pottery.prototype, tiled);


}(this));
