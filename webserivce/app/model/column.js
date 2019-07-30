'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ColumnSchema = new Schema({
    code: { type: String },
    name: { type: String },
    level: {type:Number, default:0},
    parentId: {type:String, default:''}
  });

  return mongoose.model('Column', ColumnSchema);
}