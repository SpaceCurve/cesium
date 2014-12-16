function selectLine(scene, ellipsoid, handler) {
  var DrawLineHelper = function(scene, handler) {
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

  DrawLineHelper.prototype.enableInput = function() {
    var controller = this._scene.screenSpaceCameraController;

    controller.enableTranslate = true;
    controller.enableZoom = true;
    controller.enableRotate = true;
    controller.enableTilt = true;
    controller.enableLook = true;
  };

  DrawLineHelper.prototype.disableInput = function() {
    var controller = this._scene.screenSpaceCameraController;

    controller.enableTranslate = false;
    controller.enableZoom = false;
    controller.enableRotate = false;
    controller.enableTilt = false;
    controller.enableLook = false;
  };

  DrawLineHelper.prototype.handleFinish = function(movement) {
    this.enableInput();
    var cartesian = this._scene.camera.controller.pickEllipsoid(movement.position,
                                                                     this._ellipsoid);
    if(cartesian) {
      this._mouseHandler.destroy();

      this._positions.push(cartesian);

      if(!this._polyline) {
        this._polyline = this._collection.add({width:4});
      }

      this._polyline.setPositions(this._positions);
      this._collection.remove(this._newLine);
    
      this._finishHandler(this._collection, this._ellipsoid.cartesianArrayToCartographicArray(this._positions));
    }
  };

  DrawLineHelper.prototype.handleRegionInter = function(movement) {
    var cartesian = this._scene.camera.controller.pickEllipsoid(movement.endPosition,
                                                                this._ellipsoid);
    if (cartesian) {
      if(!this._newLine) {
        this._newLine = this._collection.add({ width : 2 });
      }
      this._newLine.setPositions([this._last, cartesian]);
    }
  };

  DrawLineHelper.prototype.handleClick = function(movement) {
    var cartesian = this._scene.camera.controller.pickEllipsoid(movement.position,
                                                                this._ellipsoid);
    if (cartesian) {
      this._positions.push(cartesian);

      this._mouseHandler.setInputAction(function(movement) {
        that.handleFinish(movement);
      }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);

      if(this._last) {
        if(!this._polyline) {
          this._polyline = this._collection.add({ width : 4 });
        }
        this._polyline.setPositions(this._positions);
      }

      var that = this;
      this._last = cartesian;
      this._mouseHandler.setInputAction(function(movement) {
        that.handleRegionInter(movement);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  };

  DrawLineHelper.prototype.start = function() {
    this.disableInput();

    var that = this;

    // Now wait for start
    this._mouseHandler.setInputAction(function(movement) {
      that.handleClick(movement);
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  };

  var drawLineHelper = new DrawLineHelper(scene, handler);
  drawLineHelper.start();
}
