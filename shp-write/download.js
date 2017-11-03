(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define(['./zip'], factory);
  } else if(typeof module === "object" && module.exports) {
    module.exports = factory(require('./zip'));
  } else {
    root.test = factory();
  }
}(this, function(zipMod) {

  var downloadMod = {
    download: function(gj, options) {
      var content = zipMod.zip(gj, options);
      location.href = 'data:application/zip;base64,' + content;
    }
  };

  return downloadMod;
}));
