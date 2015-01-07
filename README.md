Cesium with Data Streaming
==========================

This code is forked from [Cesium by Analytical Graphics, Inc. (AGI)](https://github.com/AnalyticalGraphicsInc/cesium).

This Cesium build adds a GeometryBuffer object you can use to queue points, lines, and polygons onto a scene, and flush these visual elements to the GPU in a single operation. If you use a timer to regularly flush queued elements, data can be rendered as it arrives.
