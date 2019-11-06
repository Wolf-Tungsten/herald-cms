'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ResourceSchema = new Schema({
    articleId: { type: String },
    resourceName: { type: String },
    type: { type: String }, // image video appendFile
    displayName: { type: String, default: '' },
  });

  return mongoose.model('Resource', ResourceSchema);
};
