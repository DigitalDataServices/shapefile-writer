(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define(['./types', './extent'], factory);
  } else if(typeof module === "object" && module.exports) {
    module.exports = factory(require('./types'), require('./extent'));
  } else {
    root.test = factory();
  }
}(this, function(typesMod, ext) {

  var polyMod = {
    write: function(geometries, extent, shpView, shxView, TYPE) {
      this.writePoints(geometries, extent, shpView, shxView, TYPE);
    },
    writePoints: function(geometries, extent, shpView, shxView, TYPE) {
      var shpI = 0,
      shxI = 0,
      shxOffset = 100;

      geometries.forEach(function(array) {
        array.forEach(writePolyLine);
      });

      function writePolyLine(coordinates, i) {
        var noParts = polyMod.getNumParts(coordinates),
            contentLength =  polyMod.getContentLength(coordinates, TYPE);

        var featureExtent = coordinates.reduce(function(extent, c) {
            return ext.enlarge(extent, c);
        }, ext.blank());

        // INDEX
        shxView.setInt32(shxI, shxOffset / 2); // offset
        shxView.setInt32(shxI + 4, contentLength / 2); // offset length

        shxI += 8;
        shxOffset += contentLength + 8;

        shpView.setInt32(shpI, i + 1); // record number
        //  NOTE:   the total Record content length is divided by 2 since it is the
        //          'the length of the record contents section measured in 16-bit words' - not a standard 8-bit value;
        //          so a Shapefile reader will multiply this value * 2 to get the actual content length
        shpView.setInt32(shpI + 4, contentLength / 2); // Record length
        shpView.setInt32(shpI + 8, TYPE, true); // Geometry Type
        shpView.setFloat64(shpI + 12, featureExtent.xmin, true); // EXTENT
        shpView.setFloat64(shpI + 20, featureExtent.ymin, true);
        shpView.setFloat64(shpI + 28, featureExtent.xmax, true);
        shpView.setFloat64(shpI + 36, featureExtent.ymax, true);
        shpView.setInt32(shpI + 44, noParts, true); // Number of Geometry Parts
        shpView.setInt32(shpI + 48, coordinates.length, true); // Total number of points/coordinates
        shpView.setInt32(shpI + 52, 0, true); // The first part Offset = '0'

        var onlyParts = coordinates.reduce(function (arr, coords) {
            if (Array.isArray(coords[0][0])) {
                arr = arr.concat(coords);
            } else {
                arr.push(coords);
            }
            return arr;
        }, []);

        for (var p = 1; p < noParts; p++) {
            shpView.setInt32( // set part index
                shpI + 52 + (p * 4),
                onlyParts.reduce(function (a, b, idx) {
                    return idx < p ? a + b.length : a;
                }, 0),
                true
            );
        };

        //  write the coordinate (X/Y) pairs as float64 (8-byte) values
        coordinates.forEach(function writeLine(coords, i) {
            // var offsetx = shpI + 56 + (i * 16) + noParts * 4; // X
            // var offsety = shpI + 56 + (i * 16) + noParts * 4 + 8; // Y
            // console.log(offsetx + ', ' + offsety);
            shpView.setFloat64(shpI + 56 + (i * 16) + (noParts - 1) * 4, coords[0], true); // X
            shpView.setFloat64(shpI + 56 + (i * 16) + (noParts - 1) * 4 + 8, coords[1], true); // Y
        });

        //  advance the Record offset (include an additional 8 bytes for the Record number/length [int32 * 2])
        shpI += contentLength + 8;
      };
    },
    extent: function(coordinates) {
      return justCoords(coordinates).reduce(function(extent, c) {
          return ext.enlarge(extent, c);
      }, ext.blank());
    },
    parts: function(geometries, TYPE) {
      var no = 1;
      if (TYPE === typesMod.POLYGON || TYPE === typesMod.POLYLINE)  {
          no = geometries.reduce(function (no, coords) {
              no += coords.length;
              if (Array.isArray(coords[0][0][0])) { // multi
                  no += coords.reduce(function (no, rings) {
                      return no + rings.length - 1; // minus outer
                  }, 0);
              }
              return no;
          }, 0);
      };
      return no;
      // return 1;
    },
    totalPoints: function(geometries) {
      var sum = 0;
      geometries.forEach(function(g) { sum += g.length; });
      return sum;
    },
    //  @remarks:   hardcoded - need to check for outer/inner rings
    //              TODO
    getNumParts: function(geometry) {
      return 1;
    },
    getRecordLength: function(geometry, type) {
      //  include an additional 8 bytes for:
      //      - 4 bytes (int32) for the Record number
      //      - 4 btyes (int32) for the Record length
      return this.getContentLength(geometry, type) + 8;
    },
    //  @remarks:   there currently is no support for Esri's PolylineZ, PolygonZ and other variations
    //              TODO
    getContentLength: function(geometry, type) {
      return 44 +                                 //  44 bytes for the Polygon/PolyLine Record
             (this.getNumParts(geometry) * 4) +   //  the number of Polygon rings * int32
             (geometry.length * (8 * 2));         //  the number of points * 8 bytes (float64) each for X/Y coordinates
    }
  }

  function justCoords(coords, l) {
    if (l === undefined) l = [];
    if (typeof coords[0][0] == 'object') {
        return coords.reduce(function(memo, c) {
            return memo.concat(justCoords(c));
        }, l);
    } else {
        return coords;
    }
  }

  return polyMod;
}));
