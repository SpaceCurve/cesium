Cesium with Data Streaming
==========================

This code is forked from [Cesium by Analytical Graphics, Inc. (AGI)](https://github.com/AnalyticalGraphicsInc/cesium).

This Cesium build adds a [GeometryBuffer](Source/Scene/GeometryBuffer.js) object you can use to queue points, lines, and polygons onto a scene, and flush these visual elements to the GPU in a single operation. If you use a timer to regularly flush queued elements, data can be rendered as it arrives.

These instructions describe the steps you will take to use this modified Cesium build with sample data on the SpaceCurve QuickStart Virtual Machine.

Dependencies
------------

Before following these instructions, be sure you installed sample data by
following the instructions in the **Add Sample Data** section of [QuickStart for
SpaceCurve Virtual Machine](../arcadapt/quickstart.md).

Run Examples
------------

You can use two browser-based examples in the SpaceCurve VM to show data stored in the SpaceCurve System. These examples use the ArcGIS REST API, which the ArcGIS Server Adapter translates into native SpaceCurve REST API calls. In these examples, you can zoom into and out of the map using the scroll wheel on the mouse.

### The hexbin Example

To run the hexbin example, enter this URL into the FireFox browser:

`http://localhost/examples/hexbin`

The hexbin example shows areas where earthquakes have occurred. Areas with more earthquakes appear in a redder color. 

