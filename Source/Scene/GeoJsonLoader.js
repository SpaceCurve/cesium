/*global define*/
define([
    '../Core/defined',
    '../Core/defaultValue',
    '../Core/GeometryInstance',
    '../Core/PolygonGeometry',
    '../Core/Color',
    '../Core/Cartographic',
    '../Core/ColorGeometryInstanceAttribute',
    './Primitive',
    './BillboardCollection',
    './PerInstanceColorAppearance'
], function(
    defined,
    defaultValue,
    GeometryInstance,
    PolygonGeometry,
    Color,
    Cartographic,
    ColorGeometryInstanceAttribute,
    Primitive,
    BillboardCollection,
    PerInstanceColorAppearance) {
    "use strict";

    function GeoJsonLoader(ellipsoid, scene, atlas) {
        this.pending = [];
        this.scene = scene;
        this.ellipsoid = ellipsoid;
        this.billboardCollection = new BillboardCollection();
        this.billboardCollection.setTextureAtlas(atlas);
        scene.getPrimitives().add(this.billboardCollection);
        this.drawing = [];
    };

    function translateCoords(ellipsoid, coordinates) {
        if(!defined(coordinates)) throw "what";
        return ellipsoid.cartographicArrayToCartesianArray(coordinates.map(
            function(xy) { return Cartographic.fromDegrees(xy[0], xy[1]); }))
    };

    function parsePolygon(ellipsoid, coordinates) {
        return PolygonGeometry.createGeometry(new PolygonGeometry({
            polygonHierarchy: {
                positions: translateCoords(ellipsoid, coordinates[0]) // TODO: Holes
            }}));
    };

    function parseLineString(ellipsoid, coordinates) {
        return SimplePolylineGeometry.createGeometry(new SimplePolylineGeometry({
          positions : translateCoords(ellipsoid, coordinates)
        }));
    };

    var geometryParser = {
        Polygon: parsePolygon,
        LineString: parseLineString
    };

    // TODO: GeoJSON-complaint reference frame translation
    GeoJsonLoader.prototype.process = function(geoJson, appearance) {
        appearance = defaultValue(appearance, {});
        var color = defaultValue(appearance.color, Color.WHITE);
        var imageIndex = defaultValue(appearance.imageIndex, 0);
        switch(geoJson.geometry.type) {
        case 'Point':           // FIXME: Probably not a batched upload
            var billboard = this.billboardCollection.add({
              color: color,
              imageIndex: imageIndex,
              position: this.ellipsoid.cartographicToCartesian(Cartographic.fromDegrees(geoJson.geometry.coordinates[0], geoJson.geometry.coordinates[1], geoJson.geometry.coordinates[2]))
            });
            billboard.properties = geoJson.properties;
            break;
        default:
            this.pending.push(new GeometryInstance({
                id: geoJson,
                geometry: geometryParser[geoJson.geometry.type](this.ellipsoid, geoJson.geometry.coordinates),
                attributes: {
                    color: ColorGeometryInstanceAttribute.fromColor(color)
                }}));
        }

        if(this.pending.length > 512) {
          this.flush();
        }
    };

    GeoJsonLoader.prototype.flush = function() {
        if(this.pending.length == 0) return;

        console.log('Flushing ' + this.pending.length + ' geometries');

        var primitive = new Primitive({
          geometryInstances : this.pending,
          appearance : new PerInstanceColorAppearance()
        });
        this.pending = [];
        this.scene.getPrimitives().add(primitive);
        this.drawing.push(primitive);
    };

    GeoJsonLoader.prototype.clear = function() {
        this.pending = [];
        this.billboardCollection.removeAll();
        for(var i = 0; i < this.drawing.length; ++i) {
            this.scene.getPrimitives().remove(this.drawing[i]);
        }
    }

    return GeoJsonLoader;
});
