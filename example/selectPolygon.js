function selectPoly(scene, ellipsoid, handler) {
  var DrawPolyHelper = function(scene, handler) {
    this._canvas = scene.canvas;
    this._scene = scene;
    this._ellipsoid = scene.primitives.centralBody.ellipsoid;
    this._finishHandler = handler;
    this._mouseHandler = new Cesium.ScreenSpaceEventHandler(this._canvas);
    this._collection = new Cesium.PolylineCollection();
    this._scene.primitives.add(this._collection);
    this._positions = [];
    this._polyline = null;
    this._newLine = null;
    this._last = null;
  };

  DrawPolyHelper.prototype.enableInput = function() {
    var controller = this._scene.screenSpaceCameraController;

    controller.enableTranslate = true;
    controller.enableZoom = true;
    controller.enableRotate = true;
    controller.enableTilt = true;
    controller.enableLook = true;
  };

  DrawPolyHelper.prototype.disableInput = function() {
    var controller = this._scene.screenSpaceCameraController;

    controller.enableTranslate = false;
    controller.enableZoom = false;
    controller.enableRotate = false;
    controller.enableTilt = false;
    controller.enableLook = false;
  };

  DrawPolyHelper.prototype.handleFinish = function(movement) {
    this.enableInput();
    var cartesian = this._scene.camera.controller.pickEllipsoid(movement.position,
                                                                     this._ellipsoid);
    if(cartesian) {
      this._mouseHandler.destroy();
      this._scene.primitives.remove(this._collection);

      this._positions.push(cartesian);

      var poly = new Cesium.Polygon({positions : this._positions.slice(0)});
      poly.material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);
      poly.asynchronous = false;
      this._scene.primitives.add(poly);

      this._positions.push(this._positions[0]);
    
      this._finishHandler(poly, this._ellipsoid.cartesianArrayToCartographicArray(this._positions));
    }
  };

  DrawPolyHelper.prototype.handleRegionInter = function(movement) {
    var cartesian = this._scene.camera.controller.pickEllipsoid(movement.endPosition,
                                                                this._ellipsoid);
    if (cartesian) {
      if(!this._newLine) {
        this._newLine = this._collection.add({ width : 2 });
      }
      this._newLine.setPositions([this._last, cartesian]);
    }
  };

  DrawPolyHelper.prototype.handleClick = function(movement) {
    var cartesian = this._scene.camera.controller.pickEllipsoid(movement.position,
                                                                this._ellipsoid);
    if (cartesian) {
      this._positions.push(cartesian);

      if(this._last) {
        if(!this._polyline) {
          this._polyline = this._collection.add({ width : 4 });
        }
        this._polyline.setPositions(this._positions);

        this._mouseHandler.setInputAction(function(movement) {
          that.handleFinish(movement);
        }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
      }

      var that = this;
      this._last = cartesian;
      this._mouseHandler.setInputAction(function(movement) {
        that.handleRegionInter(movement);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  };

  DrawPolyHelper.prototype.start = function() {
    this.disableInput();

    var that = this;

    // Now wait for start
    this._mouseHandler.setInputAction(function(movement) {
      that.handleClick(movement);
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  };

  var drawPolyHelper = new DrawPolyHelper(scene, handler);
  drawPolyHelper.start();
}
