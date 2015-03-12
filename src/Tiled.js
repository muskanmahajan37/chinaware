/*jshint camelcase: false */

function optionValue(options, name, default_value, type) {
  if (options && options[name] !== undefined) {
    if (type === 'int') {
      return options[name] | 0;
    }
    return options[name];
  }
  return default_value;
}


function overlay(x, y, w, h) {
  var div = doc.createElement('div'),
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

//IE 8 fix help functions
function _addEventListener(element, type,listener,useCapture){
  if(element.addEventListener){
    element.addEventListener(type, listener, useCapture);
  }else if(element.attachEvent){
    element.attachEvent("on" + type, listener);
  }
}

var sjs, Sprite, Scene, Layer, Ticker_, Cycle, Input,
  doc = window.document,
  nb_scene = 0;

Scene = function Scene(options) {

  if (this.constructor !== Scene) {
    return new Scene(options);
  }

  this.autoPause = optionValue(options, 'autoPause', true);
  // main function
  this.main = optionValue(options, 'main', function () {});

  var div = doc.createElement('div'), parent;
  div.style.overflow = 'hidden';
  // TODO: detect those features
  // image-rendering: -moz-crisp-edges;
  // ms-interpolation-mode: nearest-neighbor;
  div.style.imageRendering = '-webkit-optimize-contrast';
  div.style.position = 'relative';
  div.className = 'sjs';
  div.id = 'sjs' + nb_scene;
  this.id = nb_scene;
  nb_scene = nb_scene + 1;
  parent = optionValue(options, 'parent', doc.body);
  parent.appendChild(div);
  this.w = optionValue(options, 'w', 480, 'int');
  this.h = optionValue(options, 'h', 320, 'int');
  this.dom = div;
  this.dom.style.width = this.w + 'px';
  this.dom.style.height = this.h + 'px';
  this.layers = {};
  this.ticker = null;
  this.useCanvas = optionValue(options, "useCanvas",
    global.location.href.indexOf('canvas') !== -1);

  this.xscale = 1;
  this.yscale = 1;

  // needs to be done after this.useCanvas
  this.Layer("default");
  sjs.scenes.push(this);
  return this;
};

Scene.prototype.constructor = Scene;

Scene.prototype.Sprite = function SceneSprite(src, layer) {
  // A shortcut for sjs.Sprite
  if(layer===undefined)
    sjs.error("When you create Sprite from the scene the layer should be specified or false.");
  return new Sprite(this, src, layer);
};

Scene.prototype.Layer = function SceneLayer(name, options) {
  return new Layer(this, name, options);
};

// just for convenience
Scene.prototype.Cycle = function SceneCycle(triplets) {
  return new Cycle(triplets);
};

Scene.prototype.Input = function SceneInput() {
  this.input = new Input(this);
  return this.input;
};

Scene.prototype.scale = function SceneScale(x, y) {
  this.xscale = x;
  this.yscale = y;
  this.dom.style[sjs.tproperty+"Origin"] = "0 0";
  this.dom.style[sjs.tproperty] = "scale(" + x + "," + y + ")";
};

Scene.prototype.toString = function () {
  return "Scene(" + String(this.id) + ")";
};

Scene.prototype.reset = function reset() {
  var l;
  if (this.ticker) {
    this.ticker.pause();
  }
  for (l in this.layers) {
    if (this.layers.hasOwnProperty(l)) {
      this.layers[l].dom.parentNode.removeChild(this.layers[l].dom);
      delete this.layers[l];
    }
  }
  // remove remaining children
  while (this.dom.childNodes.length >= 1) {
    this.dom.removeChild(this.dom.firstChild);
  }
  this.layers = {};
  this.Layer("default");
};

Scene.prototype.Ticker = function Ticker(paint, options) {
  if (this.ticker) {
    this.ticker.pause();
    this.ticker.paint = function () {};
  }
  this.ticker = new Ticker_(this, paint, options);
  return this.ticker;
};

Scene.prototype.loadImages = function loadImages(images, callback) {
  // function used to preload the sprite images
  if (!callback) {
    callback = this.main;
  }

  var toLoad = 0, total, div, img, src, error, scene, i;
  for (i = 0; i < images.length; i++) {
    if (!sjs.spriteCache[images[i]]) {
      toLoad += 1;
      sjs.spriteCache[images[i]] = {src: images[i], loaded: false, loading: false};
    }
  }

  if (toLoad === 0) {
    return callback();
  }

  total = toLoad;
  div = overlay(0, 0, this.w, this.h);
  div.style.textAlign = 'center';
  div.style.paddingTop = (this.h / 2 - 16) + 'px';

  div.innerHTML = 'Loading';
  this.dom.appendChild(div);
  scene = this;
  error = false;

  var _loadImg = function(src) {
    sjs.spriteCache[src].loading = true;
    img = doc.createElement('img');
    sjs.spriteCache[src].img = img;
    _addEventListener(img, 'load', function () {
      sjs.spriteCache[src].loaded = true;
      toLoad -= 1;
      if (error === false) {
        if (toLoad === 0) {
          scene.dom.removeChild(div);
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
  }

  for (src in sjs.spriteCache) {
    if (sjs.spriteCache.hasOwnProperty(src)) {
      if (!sjs.spriteCache[src].loading) {
        _loadImg(src);
      }
    }
  }
};


var MAPS_DIR = 'maps/';

var Tiled = function(){
  this.tileLayers = [];
  this.MapObj = [];
  this.tileProperties = [];
  this.playerStart = {};
  this.activeObjects = [];
  this.collisionObjects = [];

  this.load = function(url) {
    var self = this;
    Pottery.get(url, function(data){
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
    //Scene.loadImages(images, that.callback);
  };
};

var tiled = {
  Tiled: Tiled,
  Scene: Scene
};

Pottery.prototype = Pottery.extend(Pottery.prototype, tiled);
