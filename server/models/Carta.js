const mongoose = require("mongoose");

const cartaSchema = new mongoose.Schema({
    name: { type: String, require: true },
    img: { type: String, require: true},
    thumbnail: { type: String, require: true}
});

module.exports = mongoose.model("Carta", cartaSchema)