== Cesium ==

This code is forked from [Cesium by Analytical Graphics, Inc. (AGI)](https://github.com/AnalyticalGraphicsInc/cesium).

Our Cesium build adds a GeometryBuffer object you can use to queue points, lines, and polygons onto a scene, and 
flush these visual elements into the GPU in a single operation. [More understanding of GPU parallel operations may be 
needed here; polygons and lines might be 2 independent queues.] By passing visual elements in a single bulk call to 
the GPU, much faster rendering can be achieved. [right?]
