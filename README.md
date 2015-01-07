Cesium with Data Streaming
==========================

This code is forked from [Cesium by Analytical Graphics, Inc. (AGI)](https://github.com/AnalyticalGraphicsInc/cesium).

This Cesium build adds a [GeometryBuffer](Source/Scene/GeometryBuffer.js) object you can use to queue points, lines, and polygons onto a scene, and flush these visual elements to the GPU in a single operation. If you use a timer to regularly flush queued elements, data can be rendered as it arrives.

These instructions describe the steps you will take to use this modified Cesium build with sample data on the SpaceCurve QuickStart Virtual Machine.

Dependencies
------------

Before following these instructions, be sure you installed sample data by
following the instructions in the **Add Sample Data** section of [QuickStart for
SpaceCurve Virtual Machine](../../../arcadapt/blob/master/quickstart.md).

Run Example
-----------

You can use a browser-based example in the SpaceCurve VM to show data as it arrives in the browser.

In this example, the SpaceCurve VM operates as a server. Follow these steps to view the example:

1. Within the SpaceCurve VM, log in to account *spacecurve* using password *spacecurve*.
2. On the desktop within the SpaceCurve VM, double-click the Terminal icon. A terminal window opens.
3. In the terminal window, enter: ifconfig | grep 'inet addr'. 
4. Using the mouse, select the first internet address you see. The internet address is four numbers separated by periods. Yours will look something like *192.168.xx.xx*.
5. From the menu, click **Edit**, and click **Copy**.
6. In a FireFox browser on your host computer (not inside the VM), paste the internet address into the location bar, and press the **return** key.

### Query data in the Example

This example lets you query data from the SpaceCurve System. If the data contains geospatial properties, this example will render its points or polygons onto the map. This example uses a timer to flush the GeometryBuffer frequently, while data streams from the SpaceCurve System into the browser.

In this example, you can zoom into and out of the map using the scroll wheel on the mouse.

