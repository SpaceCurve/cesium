/*global define*/
define([
  '../Core/defined',
  '../Core/defaultValue',
  '../Core/GeometryInstance',
  '../Core/PolygonGeometry',
  '../Core/SimplePolylineGeometry',
  '../Core/Color',
  '../Core/ColorGeometryInstanceAttribute',
  './Primitive',
  './BillboardCollection',
  './PerInstanceColorAppearance'
], function(
  defined,
  defaultValue,
  GeometryInstance,
  PolygonGeometry,
  SimplePolylineGeometry,
  Color,
  ColorGeometryInstanceAttribute,
  Primitive,
  BillboardCollection,
  PerInstanceColorAppearance) {
  "use strict";

  function GeometryBuffer(scene, atlas) {
    this.scene = scene;
    this.billboards = new BillboardCollection();
    this.billboards.textureAtlas = atlas;
    scene.primitives.add(this.billboards);

    this.lineBuf = [];
    this.polyBuf = [];
    this.drawing = [];
  }

  GeometryBuffer.prototype.pushPoint = function(coordinates, properties, appearance) {
    appearance = defaultValue(appearance, {});
    var color = defaultValue(appearance.color, Color.WHITE);
    var image = defaultValue(appearance.image, 0);
    var billboard = this.billboards.add({
      color : color,
      image : image,
      position : coordinates,
      id : properties
    });
  };

  GeometryBuffer.prototype.pushLines = function(coordinates, properties, appearance) {
    appearance = defaultValue(appearance, {});
    var color = defaultValue(appearance.color, Color.WHITE);
    this.lineBuf.push(new GeometryInstance({
      id : properties,
      geometry : new SimplePolylineGeometry({
        positions : coordinates,
        vertexFormat : PerInstanceColorAppearance.FLAT_VERTEX_FORMAT
      }),
      attributes : {
        color : ColorGeometryInstanceAttribute.fromColor(color)
      }
    }));
  };

  GeometryBuffer.prototype.pushPolygon = function(positions, properties, appearance) {
    appearance = defaultValue(appearance, {});
    var color = defaultValue(appearance.color, Color.WHITE);
    var height = defaultValue(appearance.height, 0);
    this.polyBuf.push(new GeometryInstance({
      id : properties,
      geometry : PolygonGeometry.fromPositions({
        positions : positions,
        vertexFormat : PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
        height : height
      }),
      attributes : {
        color : ColorGeometryInstanceAttribute.fromColor(color)
      }
    }));
  };

  GeometryBuffer.prototype.flush = function(limit) {
    var numTris = this.polyBuf.length;
    var numLines = this.lineBuf.length;
    if(defined(limit)) {
      numTris = Math.min(Math.floor(limit/2), this.polyBuf.length);
      numLines = Math.min(limit - numTris, this.lineBuf.length);
      numTris = Math.min(limit - numLines, this.polyBuf.length);
    }

    if(this.polyBuf.length > 0) {
      var tris = new Primitive({
        geometryInstances : this.polyBuf.splice(0, numTris),
        appearance : new PerInstanceColorAppearance({
          closed: true,
          translucent: true,
          flat: true
        })
      });
      this.scene.primitives.add(tris);
      this.drawing.push(tris);
    }

    if(this.lineBuf.length > 0) {
      var lines = new Primitive({
        geometryInstances : this.lineBuf.splice(0, numLines),
        appearance : new PerInstanceColorAppearance({
          closed: true,
          translucent: true,
          flat: true
        })
      });
      this.scene.primitives.add(lines);
      this.drawing.push(lines);
    }
  };

  GeometryBuffer.prototype.clear = function() {
    this.polyBuf = [];
    this.lineBuf = [];

    this.billboards.removeAll();
    for(var i = 0; i < this.drawing.length; ++i) {
      this.scene.primitives.remove(this.drawing[i]);
    }
    this.drawing.length = 0;
  };

  GeometryBuffer.prototype.pending = function() {
    return this.polyBuf.length + this.lineBuf.length;
  };


  return GeometryBuffer;
});
