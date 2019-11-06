'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const PermissionSchema = new Schema({
    userId: { type: String },
    columnId: { type: String },
    level: { type: String },
  });

  return mongoose.model('Permission', PermissionSchema);
};
