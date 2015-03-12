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
