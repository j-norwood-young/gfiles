var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

var MetaSchema   = new Schema({
    filename: String,
    basename: String,
    ext: String,
    atime: Date,
    mtime: Date,
    ctime: Date,
    birthtime: Date,
    raw: Mixed,
    properties: Mixed,
    location: Mixed
});

MetaSchema.set("_perms", {
    admin: "crud",
    owner: "crud",
    user: "r",
    all: ""
});

module.exports = mongoose.model('Meta', MetaSchema);