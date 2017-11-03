(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define(['./fields', './lib'], factory);
  } else if(typeof module === "object" && module.exports) {
    module.exports = factory(require('./fields'), require('./lib'));
  } else {
    root.test = factory();
  }
}(this, function(fields, lib) {
//  MODIFIED/ADDED
  // should be greater than or equal to 7 but less than or equal to 10
  const COLUMN_NAME_LENGTH = 10;

  var dbfStructureMod = {
    /**
     * @param {Array} data
     * @param {Array} meta
     * @param {boolean} allowDuplicates
     * @param {boolean} optimize
     * @returns {Object} view
     */
    structure: function(data, meta=null, allowDuplicates=false, optimize=false) {

      let field_meta = meta || fields.multi(data);
      //  [optional] - optimize the length of the text Column widths
      if (optimize) {
          optimizeColumns(field_meta,
                          data);
      }
      let fieldDescLength = (32 * field_meta.length) + 1,
          bytesPerRecord = fields.bytesPer(field_meta), // deleted flag
          buffer = new ArrayBuffer(
              // field header
              fieldDescLength +
              // header
              32 +
              // contents
              (bytesPerRecord * data.length) +
              // EOF marker
              1
      ),
  //  END-MOD
      now = new Date(),
      view = new DataView(buffer);

      // version number - dBase III
      view.setUint8(0, 0x03);
      // date of last update
      view.setUint8(1, now.getFullYear() - 1900);
      view.setUint8(2, now.getMonth());
      view.setUint8(3, now.getDate());
      // number of records
      view.setUint32(4, data.length, true);

      // length of header
      var headerLength = fieldDescLength + 32;
      view.setUint16(8, headerLength, true);
      // length of each record
      view.setUint16(10, bytesPerRecord, true);

      // Terminator
      view.setInt8(32 + fieldDescLength - 1, 0x0D);

      //  ADDED
      //  [optional] - screen the Table Header for duplicates
      //  NOTE:   a copy of the Table Columns is made since the first Attribute row is used as a basis for creating the Table Columns
      //          and existing code uses the original Column name to retrieve row data
      let columns = !allowDuplicates ? fixDuplicates(field_meta) : field_meta;
      //  END-ADD

      //  MODIFIED
      //field_meta.forEach(function(f, i) {
      columns.forEach(function(f, i) {
          // field name
          //f.name.split('').slice(0, 8).forEach(function(c, x) {
          //  allow 10 Table Header characters - not 8
          f.name.split('').slice(0, COLUMN_NAME_LENGTH).forEach(function(c, x) {
              view.setInt8(32 + i * 32 + x, c.charCodeAt(0));
          });
      //  END-MOD
          // field type
          view.setInt8(32 + i * 32 + 11, f.type.charCodeAt(0));
          // field length
          view.setInt8(32 + i * 32 + 16, f.size);
          if (f.type == 'N') view.setInt8(32 + i * 32 + 17, 3);
      });

      offset = fieldDescLength + 32;

      data.forEach(function(row, num) {
          // delete flag: this is not deleted
          view.setUint8(offset, 32);
          offset++;
          field_meta.forEach(function(f) {
              var val = row[f.name];
              if (val === null || typeof val === 'undefined') val = '';

              switch (f.type) {
                  // boolean
                  case 'L':
                      view.setUint8(offset, val ? 84 : 70);
                      offset++;
                      break;

                  // date
                  case 'D':
                      offset = lib.writeField(view, 8,
                          lib.lpad(val.toString(), 8, ' '), offset);
                      break;

                  // number
                  case 'N':
                      offset = lib.writeField(view, f.size,
                          lib.lpad(val.toString(), f.size, ' ').substr(0, 18),
                          offset);
                      break;

                  // string
                  case 'C':
                      offset = lib.writeField(view, f.size,
                          lib.rpad(val.toString(), f.size, ' '), offset);
                      break;

                  default:
                      throw new Error('Unknown field type');
              }
          });
      });

      // EOF flag
      view.setUint8(offset, 0x1A);

      return view;
    }
  }

    //  ADDED

    //  @return:    a modified copy of the input Columns array
    function fixDuplicates(columns) {

        //  create a deep copy of the Columns
        let newColumns = JSON.parse(JSON.stringify(columns)),
            corrected = [];
        newColumns.forEach(function(column, index) {

            //  if the Column name has already been adjusted - bypass it
            if (corrected.includes(index)) {
                return;
            }
            let duplicates = getDuplicates( newColumns,
                                            column.name);
            if (duplicates.length) {

                renameDuplicates(   newColumns,
                                    duplicates);
                //  store the adjusted name indices
                duplicates.forEach(function(duplicate) {
                    corrected.push(duplicate.index);
                });
            }
        });

        return newColumns;
    }

    //  @return:    an array of 'name,index' objects
    function getDuplicates( columns,
                            name) {

        let duplicates = [],
            nameLower = name.toLowerCase().substr(0, COLUMN_NAME_LENGTH);
        columns.forEach(function(column, index) {

            if (column.name.toLowerCase().substr(0, COLUMN_NAME_LENGTH) === nameLower) {
                duplicates.push(
                    {
                        name:   name,
                        index:  index
                    }
                );
            }
        });

        return (duplicates.length > 1) ? duplicates : [];
    }

    //  @remarks: there are currently no checks if there are more than (COLUMN_NAME_LENGTH * 9) duplicate Column names (not likely...)
    function renameDuplicates(  columns,
                                duplicates) {

        let duplicateIndex = 1,
            underscore = '_';
        duplicates.forEach(function(duplicate, index) {

            //  the first duplicate name is not modified
            if (index) {

                if (duplicateIndex <= 9) {

                    let name = duplicate.name.substr(0, (COLUMN_NAME_LENGTH - (underscore.length + 1)));
                    name += underscore + duplicateIndex;
                    columns[duplicate.index].name = name;
                }
                else {
                    //  reset the indexer and add an addtional underscore characer
                    duplicateIndex  = 1;
                    underscore      += '_';
                }
            }
        });
    }

    //  @remarks:   only adjust 'text'-based Columns in an effort to reduce the size of the .dbf' file
    function optimizeColumns(   columns,
                                rows) {

        columns.forEach(function(column, index) {

            if (column.type === 'C') {

                let length = 0;
                rows.forEach(function(row) {

                    if (row[column.name] &&
                        (row[column.name].length > length)) {

                        length = row[column.name].length;
                    }
                });
                column.size = length || 1;
            }
        });
    }
    //  END-ADD

  return dbfStructureMod;
}));
