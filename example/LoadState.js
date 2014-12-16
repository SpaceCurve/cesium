function LoadState(ellipsoid, buffer, bufferGeom) {
  this.buffer = buffer;
  this.prefix = '';
  this.ellipsoid = ellipsoid;
  this.bufferGeom = bufferGeom;
  this.startTime = null;
  this.loaded = 0;
};

LoadState.prototype.consume = function(buf) {
  if(this.startTime == null) {
    this.startTime = (new Date()).getTime();
  }
  var array = new Uint8Array(buf);
  var start = 0;
  var end = findInArray(array, 10, 0);

  try {
    var x = 0;
    while(end >= 0) {
      
      var messageBytes = end - start;
      for(var i = 0; i < this.prefix.length; ++i) {
        messageBytes += this.prefix[i].byteLength;
      }
      var message = new Uint8Array(messageBytes);
      var cursor = 0;
      for(var i = 0; i < this.prefix.length; ++i) {
        message.set(this.prefix[i], cursor);
        cursor += this.prefix[i].byteLength;
      }
      var oldprefix = this.prefix;
      this.prefix = [];
      message.set(array.subarray(start, end), cursor);
      var str = u8atostr(message);
      try{ var json_obj = JSON.parse(str);} catch(e){
                console.log(e);
                console.log("line: ", this.loaded, " ", str);
                //continue;
                }
      //var json_obj = JSON.parse(str);
      
      if (Array.isArray(json_obj)){
          json_obj = json_obj[1];
        }
      x +=1;
      //console.log(json_obj.properties.NAME, json_obj, x)

      try {
        this.bufferGeom(this.ellipsoid, this.buffer, json_obj);//Delete this and accumulate into a list object
        this.loaded += 1;
      } finally {
        start = end + 1;
        end = findInArray(array, 10, start);
      }
    }
  } finally {
    this.prefix.push(array.subarray(start));
  }
};


//get sorted