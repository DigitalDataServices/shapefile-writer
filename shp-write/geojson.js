(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define([], factory);
  } else if(typeof module === "object" && module.exports) {
    module.exports = factory(require());
  } else {
    root.test = factory();
  }
}(this, function() {

  var geojsonMod = {
    justType: function (inputType, typeTYPE) {
      function int(gj) {
          var type = inputType;
          var TYPE = typeTYPE;
          var oftype = gj.features.filter(this.isType(type));
          return {
              geometries: (TYPE === 'POLYGON' || TYPE === 'POLYLINE') ? [oftype.map(this.justCoords)] : oftype.map(this.justCoords),
              properties: oftype.map(this.justProps),
              type: TYPE
          };
      };
      return int.bind(this)
    },
    justCoords: function(t) {
      if (t.geometry.coordinates[0] !== undefined &&
          t.geometry.coordinates[0][0] !== undefined &&
          t.geometry.coordinates[0][0][0] !== undefined) {
          return t.geometry.coordinates[0];
      } else {
          return t.geometry.coordinates;
      }
    },
    justProps: function(t) {
      return t.properties;
    },
    isType: function(t) {
      return function(f) { return f.geometry.type === t; };
    },
    point: function() {
      return this.justType('Point', 'POINT');
    },
    line: function() {
      return this.justType('LineString', 'POLYLINE');
    },
    polygon: function() {
      return this.justType('Polygon', 'POLYGON');
    }
  }

  return geojsonMod;
}));
