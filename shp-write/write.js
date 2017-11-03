(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define(['./types', './points', './poly', './dbf/structure', './prj'], factory);
  } else if(typeof module === "object" && module.exports) {
    module.exports = factory(require('./types'), require('./points'), require('./poly'), require('./dbf/structure'), require('./prj'));
  } else {
    root.test = factory();
  }
}(this, function(typesMod, pointWriter, polyWriter, dbf, prj) {

  var writers = {
      1: pointWriter,
      5: polyWriter,
      3: polyWriter
  };

  var recordHeaderLength = 8;

  function getShapeLength(geometries, type) {
    var length = 0;

    geometries.forEach(function(geometryArray) {
        geometryArray.forEach(function(geometry) {
          length += polyWriter.getRecordLength(geometry, type);
      });
    });
    return length;
  }

  function getShxLength(geometries) {
    var length = 0;
    geometries.forEach(function(geometryArray) {
        geometryArray.forEach(function(geometry) {
          //  8 = 2 * 16-bit fixed-length indexers
          length += 8;
      });
    });
    return length;
  }

  var writeMod = {
    write: function(rows, geometry_type, geometries, callback) {
      var ShpLen = getShapeLength(geometries)
      var ShxLen = getShxLength(geometries)
      var TYPE = typesMod[geometry_type],
          writer = writers[TYPE],
          parts = writer.parts(geometries, TYPE),
          shpLength,
          shxLength;

      if (TYPE == typesMod.POINT) {
        let parts = writer.parts(geometries, TYPE);
        shpLength = 100 + (parts - geometries.length) * 4 + writer.shpLength(geometries);
        shxLength = 100 + writer.shxLength(geometries)
      }
      else {
        shpLength = 100 + getShapeLength(geometries, TYPE);
        shxLength = 100 + getShxLength(geometries);
      }

      var shpBuffer = new ArrayBuffer(shpLength),
          shpView = new DataView(shpBuffer),
          shxBuffer = new ArrayBuffer(shxLength),
          shxView = new DataView(shxBuffer),
          extent = writer.extent(geometries);

          this.writeHeader(shpView, TYPE);
          this.writeHeader(shxView, TYPE);
          this.writeExtent(extent, shpView);
          this.writeExtent(extent, shxView);

          // set total shp file length
          shpView.setInt32(24, shpLength / 2);
          // getting value of inner array
          shxView.setInt32(24, (50 + geometries[0].length * 4));
          // shxView.setInt32(24, (100 + (geometries.length * 4) / 2));

          writer.write(
            geometries,
            extent,
            new DataView(shpBuffer, 100),
            new DataView(shxBuffer, 100),
            TYPE
          );

          var dbfBuf = dbf.structure(rows, null, false, true);

          callback(null, {
              shp: shpView,
              shx: shxView,
              dbf: dbfBuf,
              prj: prj.prj
          });

    },
    writeHeader: function(view, TYPE) {
      console.log('VIEW: ', view, 'TYPE: ', TYPE);
      view.setInt32(0, 9994);
      view.setInt32(28, 1000, true);
      view.setInt32(32, TYPE, true);
    },
    writeExtent: function(extent, view) {
      view.setFloat64(36, extent.xmin, true);
      view.setFloat64(44, extent.ymin, true);
      view.setFloat64(52, extent.xmax, true);
      view.setFloat64(60, extent.ymax, true);
    }
  };

  return writeMod;
}));
