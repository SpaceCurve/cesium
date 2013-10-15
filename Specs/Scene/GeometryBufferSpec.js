/*global defineSuite*/
defineSuite([
    'Scene/GeometryBuffer',
    'Scene/CompositePrimitive',
    'Core/Ellipsoid',
    'Core/Cartographic'
], function(
    GeometryBuffer,
    CompositePrimitive,
    Ellipsoid,
    Cartographic
) {
    "use strict";
    /*global it,expect,beforeEach,afterEach,beforeAll,afterAll*/

    var points = Ellipsoid.WGS84.cartesianArrayToCartographicArray([
        Cartographic.fromDegrees(0, 0),
        Cartographic.fromDegrees(0, 10),
        Cartographic.fromDegrees(10, 10),
        Cartographic.fromDegrees(10, 0),
        Cartographic.fromDegrees(0, 0)]);

    var buffer;
    var scene;

    beforeEach(function() {
        scene = { primitives : new CompositePrimitive(),
                  getPrimitives : function() {
                      return this.primitives;
                  }};
        var atlas = {};
        buffer = new GeometryBuffer(scene, atlas);
    });

    it('buffers points', function() {
        buffer.pushPoint(points[0]);
        buffer.pushPoint(points[1]);
        expect(buffer.billboards._billboards.length).toEqual(2);
    });

    it('buffers lines', function() {
        buffer.pushLines(points);
        expect(buffer.lineBuf.length).toEqual(1);
    });

    it('buffers polygons', function() {
        buffer.pushPolygon(points);
        expect(buffer.polyBuf.length).toEqual(1);
    });

    it('can buffer lines and polygons', function() {
        buffer.pushLines(points);
        buffer.pushPolygon(points);
        
        expect(buffer.pending()).toEqual(2);
    });

    it('can be cleared of pending geometry', function() {
        buffer.pushPoint(points[0]);
        buffer.pushLines(points);
        buffer.pushPolygon(points);
        
        buffer.clear();
        
        expect(buffer.pending()).toEqual(0);
        expect(buffer.billboards._billboards.length).toEqual(0);
    });

    it('creates primitives', function() {
        buffer.pushLines(points);
        buffer.pushPolygon(points);
        buffer.flush();
        
        expect(scene.getPrimitives().getLength()).toEqual(2);
    });

    it('removes created primitives on clear', function() {
        buffer.pushLines(points);
        buffer.pushPolygon(points);
        buffer.flush();

        buffer.clear();
        
        expect(scene.getPrimitives().getLength()).toEqual(0);
    });
});
