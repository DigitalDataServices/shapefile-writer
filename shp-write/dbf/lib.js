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



  var dbfLibMod = {
    /**
     * @param {string} str
     * @param {number} len
     * @param {string} char
     * @returns {string}
     */
    lpad: function(str, len, char) {
       while (str.length < len) { str = char + str; } return str;
    },
    /**
     * @param {string} str
     * @param {number} len
     * @param {string} char
     * @returns {string}
     */
    rpad: function(str, len, char) {
      while (str.length < len) { str = str + char; } return str;
    },
    /**
     * @param {object} view
     * @param {number} fieldLength
     * @param {string} str
     * @param {number} offset
     * @returns {number}
     */
    writeField: function(view, fieldLength, str, offset) {
      for (var i = 0; i < fieldLength; i++) {
        view.setUint8(offset, str.charCodeAt(i)); offset++;
    }
    return offset;
    }
  }

  return dbfLibMod;
}));
