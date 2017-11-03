(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define(['./fieldsize'], factory);
  } else if(typeof module === "object" && module.exports) {
    module.exports = factory(require('./fieldsize'));
  } else {
    root.test = factory();
  }
}(this, function(fieldSize) {

  var types = {
    string: 'C',
    number: 'N',
    boolean: 'L',
    // type to use if all values of a field are null
    null: 'C'
};

  var dbfFieldsMod = {
    multi: function(features) {
      var fields = {};
      features.forEach(collect);
      function collect(f) { inherit(fields, f); }
      return this.obj(fields);
    },
    obj: function(_) {
      var fields = {}, o = [];
      for (var p in _) fields[p] = _[p] === null ? 'null' : typeof _[p];
      for (var n in fields) {
          var t = types[fields[n]];
          if(t){
               o.push({
                  name: n,
                  type: t,
                  size: fieldSize[t]
              });
          }
      }
      return o;
    },
    /**
     * @param {Array} fields
     * @returns {Array}
     */
    bytesPer: function(fields) {
      // deleted flag
    return fields.reduce(function(memo, f) { return memo + f.size; }, 1);
    }
  }

  /**
 * @param {Object} a
 * @param {Object} b
 * @returns {Object}
 */
  function inherit(a, b) {
    for (var i in b) {
        var isDef = typeof b[i] !== 'undefined' && b[i] !== null;
        if (typeof a[i] === 'undefined' || isDef) {
          a[i] = b[i];
        }
    }
    return a;
  };

  return dbfFieldsMod;
}));
