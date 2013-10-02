/*global define*/
define([
    '../Core/defined',
    '../Core/defaultValue',
    '../Core/GeometryInstance',
    '../Core/PolygonGeometry',
    '../Core/SimplePolylineGeometry',
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
    SimplePolylineGeometry,
    Color,
    Cartographic,
    ColorGeometryInstanceAttribute,
    Primitive,
    BillboardCollection,
    PerInstanceColorAppearance) {
    "use strict";

    function GeoJsonLoader(ellipsoid, scene, atlas) {
        this.pendingTris = [];
        this.pendingLines = [];
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
        return new PolygonGeometry({
            polygonHierarchy: {
                positions: translateCoords(ellipsoid, coordinates[0]), // TODO: Holes
                vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
            }});
    };

    function parseLineString(ellipsoid, coordinates) {
        return new SimplePolylineGeometry({
          positions : translateCoords(ellipsoid, coordinates),
          vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
        });
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
        var pending;
        switch(geoJson.geometry.type) {
        case 'LineString':
        case 'MultiLineString':
            pending = this.pendingLines;
            break;

        case 'Polygon':
        case 'MultiPolygon':
            pending = this.pendingTris;
            break;

        case 'Point':
        case 'MultiPoint':
            break;

        default:
            throw "Unimplemented";
        }
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
            pending.push(new GeometryInstance({
                id: { properties: geoJson.properties },
                geometry: geometryParser[geoJson.geometry.type](this.ellipsoid, geoJson.geometry.coordinates),
                attributes: {
                    color: ColorGeometryInstanceAttribute.fromColor(color)
                }}));
        }
    };

    GeoJsonLoader.prototype.flush = function(limit) {
        var numTris = this.pendingTris.length;
        var numLines = this.pendingLines.length;
        if(defined(limit)) {
            numTris = Math.min(Math.floor(limit/2), this.pendingTris.length);
            numLines = Math.min(limit - numTris, this.pendingLines.length);
            numTris = Math.min(limit - numLines, this.pendingTris.length);
        }

        console.log('Flushing ' + numTris + ' polygons and ' + numLines + ' polylines.');

        if(this.pendingTris.length > 0) {
            var primitive = new Primitive({
                geometryInstances : this.pendingTris.splice(0, numTris),
                appearance : new PerInstanceColorAppearance({
                    closed: true,
                    translucent: true,
                    flat: true
                })
            });
            this.scene.getPrimitives().add(primitive);
            this.drawing.push(primitive);
        }

        if(this.pendingLines.length > 0) {
            var primitive = new Primitive({
                geometryInstances : this.pendingLines.splice(0, numLines),
                appearance : new PerInstanceColorAppearance({
                    closed: true,
                    translucent: true,
                    flat: true
                })
            });
            this.scene.getPrimitives().add(primitive);
            this.drawing.push(primitive);
        }
    };

    GeoJsonLoader.prototype.clear = function() {
        this.pendingTris = [];
        this.pendingLines = [];

        this.billboardCollection.removeAll();
        for(var i = 0; i < this.drawing.length; ++i) {
            this.scene.getPrimitives().remove(this.drawing[i]);
        }
        this.drawing.length = 0;
    }

    GeoJsonLoader.prototype.pending = function() {
        return this.pendingTris.length + this.pendingLines.length;
    }

    return GeoJsonLoader;
});
