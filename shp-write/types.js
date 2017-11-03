(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define([], factory);
  } else if(typeof module === "object" && module.exports) {
    module.exports = factory(require());
  } else {
    root.test = factory();
  }
}(this, function() {

  var typesMod = {
    NULL: 0,
    POINT: 1,
    POLYLINE: 3,
    POLYGON: 5,
    MULTIPOINT: 8,
    POINTZ: 11,
    POLYLINEZ: 13,
    POLYGONZ: 15,
    MULTIPOINTZ: 18,
    POINTM: 21,
    POLYLINEM: 23,
    POLYGONM: 25,
    MULTIPOINTM: 28,
    MULTIPATCH: 31,
  };

  return typesMod;
}));
