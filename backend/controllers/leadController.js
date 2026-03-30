const Lead = require('../models/Lead');
const csv = require('csv-parser');
const fs = require('fs');
const { CLIENT_RENEG_LIMIT } = require('tls');

// @route   GET /api/leads
// @desc    Get all leads
exports.getLeads = async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   POST /api/leads
// @desc    Create a lead
exports.createLead = async (req, res) => {
    try {
        const newLead = new Lead(req.body);
        const lead = await newLead.save();
        res.json(lead);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @route   PUT /api/leads/:id
// @desc    Update a lead
exports.updateLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        res.json(lead);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @route   DELETE /api/leads/:id
// @desc    Delete a lead
exports.deleteLead = async (req, res) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Lead removed' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @route   DELETE /api/leads/bulk
// @desc    Bulk delete leads
exports.bulkDeleteLeads = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ error: 'Please provide an array of IDs' });
        }
        await Lead.deleteMany({ _id: { $in: ids } });
        res.json({ msg: 'Leads removed' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @route   POST /api/leads/upload
// @desc    Upload CSV and parse
exports.uploadCSV = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Please upload a CSV file" });

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                let count = 0;
                for (const rawRow of results) {
                    const row = {};
                    for (let k in rawRow) {
                        const newK = k.replace(/^\uFEFF/, '').trim().toLowerCase();
                        row[newK] = typeof rawRow[k] === 'string' ? rawRow[k].trim() : rawRow[k];
                    }

                    // Helper to find a value by a loosely matching key
                    const findValue = (keywords) => {
                        for (let key in row) {
                            if (keywords.some(kw => key.includes(kw))) {
                                return row[key];
                            }
                        }
                        return "";
                    };

                    // Normalize fields aggressively using keyword matching
                    const name = findValue(["name", "business", "company", "title"]);
                    const phone = findValue(["phone", "mobile", "contact", "tel", "whatsapp"]);
                    let ratingVal = findValue(["rating", "star"]);
                    let reviewsVal = findValue(["review", "count"]);
                    const website = findValue(["website", "Website", "url", "domain"]);
                    let mapsLink = findValue(["map", "link"]);

                    if (!mapsLink) {
                        // Fallback: search values for google maps URL
                        mapsLink = Object.values(row).find(val => typeof val === 'string' && val.includes('maps.google')) || "";
                    }

                    if (!phone || !name) continue; // skip if crucial data is missing

                    const rating = parseFloat(ratingVal || 0);
                    const reviews = Number(reviewsVal) || 0;

                    // Duplicate check (normalized phone)
                    const cleanPhone = phone.toString().replace(/[^0-9+]/g, '');

                    if (cleanPhone.length >= 6) {
                        const existing = await Lead.findOne({ phone: cleanPhone });
                        if (!existing) {
                            const newLead = new Lead({
                                name,
                                phone: cleanPhone,
                                rating: isNaN(rating) ? 0 : rating,
                                reviews: isNaN(reviews) ? 0 : reviews,
                                website,
                                mapsLink,
                                status: "Not Called",
                            });
                            await newLead.save();
                            count++;
                        }
                    }
                }
                // Cleanup file
                fs.unlinkSync(req.file.path);

                if (count === 0) {
                    return res.status(400).json({ error: "No new leads added. They may be duplicates or missing valid Phone/Name headers." });
                }
                res.json({ msg: "CSV Processed", leadsAdded: count });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
};
