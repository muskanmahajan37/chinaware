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

Pottery.prototype = Pottery.extend(Pottery.prototype, Tiled);
