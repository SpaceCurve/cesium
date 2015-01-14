Cesium with Data Streaming
==========================

This code is forked from [Cesium by Analytical Graphics, Inc. (AGI)](https://github.com/AnalyticalGraphicsInc/cesium).

This Cesium build adds a [GeometryBuffer](Source/Scene/GeometryBuffer.js) object you can use to queue points, lines, and polygons onto a scene, and flush these visual elements to the GPU in a single operation. If you use a timer to regularly flush queued elements, data can be rendered as it arrives.

These instructions describe the steps you will take to use this modified Cesium build with sample data on the SpaceCurve QuickStart Virtual Machine.

Dependencies
------------

* Before following these instructions, be sure you installed sample data by
following the instructions in the **Add Sample Data** section of [QuickStart for
SpaceCurve Virtual Machine](../../../arcadapt/blob/master/quickstart.md).

* This example requires a browser that includes WebGL. A browser that runs [Cesium Demos](http://cesiumjs.org/) should also run this example.

Run Node.js to host Cesium
--------------------------

Our Virtual Machine includes Node.js to run Cesium. To boot the Virtual Machine and log in, follow steps in [QuickStart for SpaceCurve Virtual Machine](../../../arcadapt/blob/master/quickstart.md). Then follow these steps to start the Node.js server:

2. In the Virtual Machine, double-click the Terminal icon at the top-center of the desktop, next to the Firefox icon. 
3. In the terminal window, enter these commands:

        $ cd ~/cesium
        $ node server.js 5555

Run Example in Client Browser
-----------------------------

You can use a browser-based example in the SpaceCurve VM to show data as it arrives in the browser.

In this example, the SpaceCurve VM operates as a server. Follow these steps to view the example:

2. On the desktop within the SpaceCurve VM, double-click the Terminal icon. A terminal window opens.
3. In the terminal window, enter:

        ifconfig | grep 'inet addr'
        
4. Using the mouse, select the first internet address you see. The internet address is four numbers separated by periods. Yours will look something like *192.168.xx.xx*.
5. From the menu, click **Edit**, and click **Copy**.
6. In a browser on your host computer (not inside the VM), paste the internet address into the location bar, add **:5555** to the address, and press the **return** key. The address in the browser will look *similar* to this:

        192.168.11.11:5555

### Query data in the Example

This example lets you query data from the SpaceCurve System. If the data contains geospatial properties, this example will render its points or polygons onto the map. This example uses a timer to flush the GeometryBuffer frequently, while data streams from the SpaceCurve System into the browser.

Enter one of these queries into the **Manual Query** field. You will see points or polygons appear on the map of the United States. Note that visual rendering begins before all of the data has arrived.

    select * from schema.us_counties;
    select * FROM schema.us_cities where "properties"."NAME" LIKE 'S%' ;   
    select * from schema.us_counties where "properties"."POP2000" > 10000 ;  

This example shows points as dots, and shades polygons according to their POP2000 property value. In this example, you can zoom into and out of the map using the scroll wheel on the mouse.

