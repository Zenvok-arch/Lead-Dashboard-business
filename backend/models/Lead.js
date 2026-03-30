const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    website: { type: String, default: "" },
    phone: { type: String, required: true },
    mapsLink: { type: String, default: "" },
    status: { 
        type: String, 
        enum: ["Not Called", "Called", "Interested", "Closed"], 
        default: "Not Called" 
    },
    notes: { type: String, default: "" },
    lastContacted: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', LeadSchema);
