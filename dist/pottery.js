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


Class.create("Tiled", {
  el: null,
  url: "",
  tile_w: 0,
  tile_h: 0,
  tilesets: [],
  width: 0,
  height: 0,
  layers: [],
  objects: [],
  scene: null,
  _ready: null,
  initialize: function() {
  },
  ready: function(callback) {
    this._ready = callback;
  },
  load: function(scene, el, url) {
    var self = this;
    this.el = el;
    this.url = url;
    this.scene = scene;
    Pottery.get(this.url, function(data) {
      self.tile_w = data.tileheight;
      self.tile_h = data.tilewidth;
      self.width = data.width;
      self.height = data.height;
      self.tilesets = data.tilesets;
      self.layers = data.layers;
      var props = self.tilesets[0].tileproperties,
        new_props = {};
      if (props) {
        for (var key in props) {
          new_props[+key+1] = props[key];
        }
        self.tilesets[0].tileproperties = new_props;
      }
      self._draw();
    });
  },
  _draw: function() {
    this.map = this.scene.createElement();
    this.el_layers = [];
    var x, y, tileset;
    var id, _tile, _id;
    for (var i=0 ; i < this.layers.length ; i++) {
      id = 0;
      this.el_layers[i] = this.scene.createElement();
      tileset = this.tilesets[0];
      if (this.layers[i].data) {
        for (var k=0 ; k < this.layers[i].height ; k++) {
          for (var j=0 ; j < this.layers[i].width ; j++) {
            _tile = this.scene.createElement();

            _id = this.layers[i].data[id];
            if (_id != 0) {
              _id--;
              y = this.tile_h * parseInt(_id / (Math.round(tileset.imagewidth / this.tile_h)));
              x = this.tile_w * (_id % Math.round(tileset.imagewidth / this.tile_w));

              _tile.drawImage(tileset.name, x, y, this.tile_w, this.tile_h, j * this.tile_w, k * this.tile_h, this.tile_w, this.tile_h);
              this.el_layers[i].append(_tile);
            }
            id++;
          }
        }
      }
      else {
        this.objects.push(this.el_layers[i]);
      }
      this.map.append(this.el_layers[i]);
    }
    this.el.append(this.map);
    if (this._ready) this._ready.call(this);
  },
  getLayerObject: function(pos) {
    if (!pos) pos = 0;
    return this.objects[pos];
  },
  getLayer: function(id) {
    return this.el_layers[id];
  },
  getMap: function(id) {
    return this.map;
  },
  getTileWidth: function() {
    return this.tile_w;
  },
  getTileHeight: function() {
    return this.tile_h;
  },
  getWidthPixel: function() {
    return this.width * this.getTileWidth();
  },
  getHeightPixel: function() {
    return this.height * this.getTileHeight();
  },
  getDataLayers: function() {
    var layer = [];
    for (var i=0 ; i < this.layers.length ; i++) {
      if (this.layers[i].data) layer.push(this.layers[i].data);
    }
    return layer;
  },
  getTileInMap: function(x, y, pos) {
    if (!pos) pos = 0;
    var tileset = this.tilesets[pos];
    var tile_pos = this.width * y + x;
    return tile_pos;
  },
  getTileProperties: function(tile, layerOrX, y) {
    var self = this;
    var tileset = this.tilesets[0];
    function _getTileLayers(tile) {
      var _layers = [];
      for (var i=0 ; i < self.layers.length ; i++) {
        if (self.layers[i].data) _layers.push(tileset.tileproperties[self.layers[i].data[tile]]);
      }
      return _layers;
    }

    if (layerOrX === undefined) {
      return _getTileLayers(tile);
    }
    else if (y !== undefined) {
      var new_tile = this.getTileInMap(layerOrX, y);
      return _getTileLayers(new_tile);
    }
    return tileset.tileproperties[this.layers[layerOrX].data[tile]];
  }
});

var Tiled = {
  Tiled: {
    new: function(scene, el, url) {
      return Class.new("Tiled", [scene, el, url]);
    }
  }
};


}(this));
