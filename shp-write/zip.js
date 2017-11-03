(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define(['../jszip/jszip', './geojson', './write', './prj'], factory);
  } else if(typeof module === "object" && module.exports) {
    module.exports = factory(require('../jszip/jszip'), require('./geojson'), require('./write'), require('./prj'));
  } else {
    root.test = factory();
  }
}(this, function(JSZip, geojsonMod, writeMod, prj) {

  var zipMod = {

    zip: function (gj, options) {
      var zip = new JSZip(),
          layers = zip.folder(options && options.folder ? options.folder : 'layers');

      [geojsonMod.justType('Point', 'POINT'), geojsonMod.justType('LineString', 'POLYLINE'), geojsonMod.justType('Polygon', 'POLYGON')]
          .forEach(function(l) {
            var item = l(gj)
          if (item.geometries.length && item.geometries[0].length) {
              writeMod.write(
                  // field definitions
                  item.properties,
                  // geometry type
                  item.type,
                  // geometries
                  item.geometries,
                  function(err, files) {
                      var fileName = options && options.types[item.type.toLowerCase()] ? options.types[item.type.toLowerCase()] : item.type;
                      layers.file(fileName + '.shp', files.shp.buffer, { binary: true });
                      layers.file(fileName + '.shx', files.shx.buffer, { binary: true });
                      layers.file(fileName + '.dbf', files.dbf.buffer, { binary: true });
                      layers.file(fileName + '.prj', prj.prj);
                  });
          }
      });

      return zip.generateAsync({type: "blob"})
    }
  };

  return zipMod;
}));
