# Shapefile Writer #


### Description ###
AMD Shapefile Writer for Web AppBuilder utilizing jszip to produce zipped shapefiles capable of being uploaded with Web AppBuilder. The module was designed for use as a WAB Feature Action, but may be applicable anywhere when handling geojson. Original source code was adapted to support multiple features with unique attributes, and to be more applicable to Web AppBuilder.

![shp-write](https://user-images.githubusercontent.com/8050421/32394176-d82208d4-c0a1-11e7-9b45-e4036f6fd6ba.png)

### Requirements ###
Shapefile Writer  was developed using Web AppBuilder v2.5, but should be compatible with older versions that support AMD.
[Third Party Library Documentation](https://developers.arcgis.com/web-appbuilder/sample-code/add-a-third-party-library.htm)

### Table of Contents ###
- [Installation](#installation)
- [Usage](#usage)
- [Limitations](#limitations)
- [History](#history)
- [Credits](#credits)
- [License](#license)

### Installation ###
1. Copy shapefile-writer library into the libs folder of Web AppBuilder.
2. In jimu/exportUtils.js create a method utilizing existing methods that returns geojson (geojson to be utilized within a feature action).
```
EXAMPLE:

getGeoJsonForShpFile: function() {
        return this.getExportString()
      }
```
3. Create feature action that utilizes the newly created method to return geojson for use with the shapefile-writer library.
	- [Create Feature Action Documentation](https://developers.arcgis.com/web-appbuilder/guide/create-a-feature-action-in-your-widget.htm)
4. Bring, into the new feature action, exportUtils, and the zipModule from the shapefile-writer library.
```
EXAMPLE:

define([
  'dojo/_base/declare',
  '../BaseFeatureAction',
  '../exportUtils',
  '../../libs/jszip/jszip',
  '../../libs/shp-write/zip'
], function(declare, BaseFeatureAction, exportUtils, jszip, zipMod){
  var clazz = declare(BaseFeatureAction, {
    name: 'ExportToShapefile',
    iconClass: 'icon-export',

    isFeatureSupported: function(featureSet){
      return featureSet.features.length > 0 && featureSet.features[0].geometry;
    },

    onExecute: function(featureSet){
      var ds = exportUtils.createDataSource({
        type: exportUtils.TYPE_FEATURESET,
        filename: 'features',
        data: featureSet
      });


      ds.setFormat(exportUtils.FORMAT_GEOJSON);

      ds.getGeoJsonForShpFile()
        .then(function(geojson) {
          var parsedGj = JSON.parse(geojson)

          return zipMod.zip(parsedGj)
      })
        .then(function(res) {

          saveAs(res, "ExportShp.zip")
        });
    }

  });
  return clazz;
});
```


### Usage ###
1. Utilizing the zip.js module, pass parsed geojson into the zip module's zip method (returns promise).
```
zipMod.zip(parsedStr)
```
2. Utilize WAB global saveAs method to save the zip file.
```
saveAs(res, "ExportShp.zip")
```

### Limitations ###

Currently supports 2D points, lines, and polygons.

### History ###

2017-11-03 - Initial upload.

### Credits ###
Tom MacWright [Original Source](https://github.com/mapbox/shp-write) </br>

DDS [Digital Data Services, Inc.](http://www.digitaldataservices.com), is a Geocortex Implementation Solution Provider and Esri Silver Business Partner that specializes in the creation, conversion, management, integration, and presentation of geospatial information. Our expertise focuses on providing simple solutions to complex business challenges and allowing our clients to leverage and explore their data in new and unique ways. As experts in research, data processing, data storage/management, data analysis, and presentation, we serve our clients by making complex analytical decisions available to everyone. Our vision is that access to geospatial information should not be a barrier to making business decisions.

### License ###

[Original License] (https://github.com/mapbox/shp-write/blob/master/LICENSE)

Copyright (c) 2015, Mapbox
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of shp-write nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


DDS License

Copyright © 2016 [Digital Data Services, Inc.](http://www.digitaldataservices.com/geocortex) All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
