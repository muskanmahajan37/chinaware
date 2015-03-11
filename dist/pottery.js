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

var Tiled = Pottery.prototype.Class(function (tiled) {
  tiled.el = null;
  tiled.url = "";
  tiled.tile_w = 0;
  tiled.tile_h = 0;
  tiled.tilesets = [];
  tiled.width = 0;
  tiled.height = 0;
  tiled.layers = [];
  tiled.objects = [];
  tiled.scene = null;
  tiled._ready = null;

  tiled.initialize = function () {

  };
  tiled.ready = function (callback) {
    tiled._ready = callback;
  };

  tiled.load = function (scene, el, url) {
    tiled.el = el;
    tiled.url = url;
    tiled.scene = scene;
    Pottery.get(tiled.url, function (data) {
      tiled.tile_w = data.tileheight;
      tiled.tile_h = data.tilewidth;
      tiled.width = data.width;
      tiled.height = data.height;
      tiled.tilesets = data.tilesets;
      tiled.layers = data.layers;
      var props = tiled.tilesets[0].tileproperties,
        new_props = {};
      if (props) {
        for (var key in props) {
          new_props[+key + 1] = props[key];
        }
        tiled.tilesets[0].tileproperties = new_props;
      }
      tiled._draw();
    });
  };

  tiled._draw = function () {
    tiled.map = tiled.scene.createElement();
    tiled.el_layers = [];
    var x, y, tileset;
    var id, _tile, _id;
    for (var i = 0; i < tiled.layers.length; i++) {
      id = 0;
      tiled.el_layers[i] = tiled.scene.createElement();
      tileset = tiled.tilesets[0];
      if (tiled.layers[i].data) {
        for (var k = 0; k < tiled.layers[i].height; k++) {
          for (var j = 0; j < tiled.layers[i].width; j++) {
            _tile = tiled.scene.createElement();

            _id = tiled.layers[i].data[id];
            if (_id !== 0) {
              _id--;
              y = tiled.tile_h * parseInt(_id / (Math.round(tileset.imagewidth / tiled.tile_h)), 10);
              x = tiled.tile_w * (_id % Math.round(tileset.imagewidth / tiled.tile_w));

              _tile.drawImage(tileset.name, x, y, tiled.tile_w, tiled.tile_h, j * tiled.tile_w, k * tiled.tile_h, tiled.tile_w, tiled.tile_h);
              tiled.el_layers[i].append(_tile);
            }
            id++;
          }
        }
      }
      else {
        tiled.objects.push(tiled.el_layers[i]);
      }
      tiled.map.append(tiled.el_layers[i]);
    }
    tiled.el.append(tiled.map);
    if (tiled._ready) {
      tiled._ready.call(this);
    }
  };

  tiled.getLayerObject = function (pos) {
    if (!pos) {
      pos = 0;
    }
    return tiled.objects[pos];
  };
  tiled.getLayer = function (id) {
    return tiled.el_layers[id];
  };
  tiled.getMap = function () {
    return tiled.map;
  };
  tiled.getTileWidth = function () {
    return tiled.tile_w;
  };
  tiled.getTileHeight = function () {
    return tiled.tile_h;
  };
  tiled.getWidthPixel = function () {
    return tiled.width * tiled.getTileWidth();
  };
  tiled.getHeightPixel = function () {
    return tiled.height * tiled.getTileHeight();
  };
  tiled.getDataLayers = function () {
    var layer = [];
    for (var i = 0; i < tiled.layers.length; i++) {
      if (tiled.layers[i].data) {
        layer.push(tiled.layers[i].data);
      }
    }
    return layer;
  };
  tiled.getTileInMap = function (x, y, pos) {
    if (!pos) {
      pos = 0;
    }

    var tile_pos = tiled.width * y + x;
    return tile_pos;
  };
  tiled.getTileProperties = function (tile, layerOrX, y) {
    var tileset = tiled.tilesets[0];

    function _getTileLayers(tile) {
      var _layers = [];
      for (var i = 0; i < tiled.layers.length; i++) {
        if (tiled.layers[i].data) {
          _layers.push(tileset.tileproperties[tiled.layers[i].data[tile]]);
        }
      }
      return _layers;
    }

    if (layerOrX === undefined) {
      return _getTileLayers(tile);
    }
    else if (y !== undefined) {
      var new_tile = tiled.getTileInMap(layerOrX, y);
      return _getTileLayers(new_tile);
    }
    return tileset.tileproperties[tiled.layers[layerOrX].data[tile]];
  };
});

var tiled = {
  Tiled: Tiled
};

Pottery.prototype = Pottery.extend(Pottery.prototype, tiled);


}(this));
