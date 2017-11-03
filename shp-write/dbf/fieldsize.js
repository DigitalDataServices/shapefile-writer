(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define([], factory);
  } else if(typeof module === "object" && module.exports) {
    module.exports = factory(require());
  } else {
    root.test = factory();
  }
}(this, function() {

  // NOTE: EXAMPLE MODULE
  // var myModule = {
  //   sayHi:function() {
  //     console.log('hi');
  //   },
  //   dispose: function() {
  //     console.log('rewmoved');
  //   }
  // };



  var dbfFieldSizeMod = {
    // string
    C: 254,
    // boolean
    L: 1,
    // date
    D: 8,
    // number
    N: 18,
    // number
    M: 18,
    // number, float
    F: 18,
    // number
    B: 8
  }

  return dbfFieldSizeMod;
}));
