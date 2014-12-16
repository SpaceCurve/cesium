function selectCircle(scene, ellipsoid, handler) {
  var DrawCircleHelper = function(scene, handler) {
    this._canvas = scene.canvas;
    this._scene = scene;
    this._ellipsoid = scene.primitives.centralBody.ellipsoid;
    this._finishHandler = handler;
    this._mouseHandler = new Cesium.ScreenSpaceEventHandler(this._canvas);
    this._circle = null;
    this._center = null;
    this._lastEdge = null;
  };

  DrawCircleHelper.prototype.enableInput = function() {
    var controller = this._scene.screenSpaceCameraController;

    controller.enableTranslate = true;
    controller.enableZoom = true;
    controller.enableRotate = true;
    controller.enableTilt = true;
    controller.enableLook = true;
  };

  DrawCircleHelper.prototype.disableInput = function() {
    var controller = this._scene.screenSpaceCameraController;

    controller.enableTranslate = false;
    controller.enableZoom = false;
    controller.enableRotate = false;
    controller.enableTilt = false;
    controller.enableLook = false;
  };

  DrawCircleHelper.prototype.setPolyPts = function(radius) {
    if(this._circle != null) {
      this._scene.primitives.remove(this._circle);
    }
    
    var material = Cesium.Material.fromType(Cesium.Material.ColorType);
    material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);
    this._circle = new Cesium.Primitive({
      geometryInstances : new Cesium.GeometryInstance({
        geometry : new Cesium.CircleGeometry({
          ellipsoid : this._ellipsoid,
          center : this._center,
          radius : radius
        }),
      }),
      appearance : new Cesium.EllipsoidSurfaceAppearance({material : material})
    });
    this._circle.asynchronous = false;
    this._scene.primitives.add(this._circle);
  };

  DrawCircleHelper.prototype.handleRegionStop = function(movement) {
    this.enableInput();
    var cartesian = this._scene.camera.controller.pickEllipsoid(movement.position,
                                                                     this._ellipsoid);
    if(cartesian) {
      this._lastEdge = cartesian;
    }

    this._mouseHandler.destroy();

    if(this._lastEdge) {
      this._finishHandler(this._circle, this._ellipsoid.cartesianToCartographic(this._center), Cesium.Cartesian3.magnitude(Cesium.Cartesian3.subtract(this._center, this._lastEdge)));
    }
  };

  DrawCircleHelper.prototype.handleRegionInter = function(movement) {
    var cartesian = this._scene.camera.controller.pickEllipsoid(movement.endPosition,
                                                                     this._ellipsoid);
    if (cartesian) {
      this._lastEdge = cartesian;
      this.setPolyPts(Cesium.Cartesian3.magnitude(Cesium.Cartesian3.subtract(this._center, cartesian)));
    }
  };

  DrawCircleHelper.prototype.handleRegionStart = function(movement) {
    var cartesian = this._scene.camera.controller.pickEllipsoid(movement.position,
                                                                     this._ellipsoid);
    if (cartesian) {
      var that = this;
      this._center = cartesian;
      this._mouseHandler.setInputAction(function(movement) {
        that.handleRegionStop(movement);
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
      this._mouseHandler.setInputAction(function(movement) {
        that.handleRegionInter(movement);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  };

  DrawCircleHelper.prototype.start = function() {
    this.disableInput();

    var that = this;

    // Now wait for start
    this._mouseHandler.setInputAction(function(movement) {
      that.handleRegionStart(movement);
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  };

  var drawCircleHelper = new DrawCircleHelper(scene, handler);
  drawCircleHelper.start();
}
