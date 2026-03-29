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
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
                for (const row of results) {
                    // Normalize fields
                    const name = row.name || row.Name || row.business_name || "";
                    const phone = row.phone || row.Phone || row.mobile || "";
                    const rating = parseFloat(row.rating || row.Rating || 0);
                    const reviews = Number(row.reviews || row.Reviews) || 0;
                    const website = row.website || row.Website || "";
                    const mapsLink = row.mapsLink || row.MapsLink || row.link || "";

                    if (!phone || !name) continue;

                    // Duplicate check (normalized phone)
                    const cleanPhone = phone.toString().replace(/\D/g, '');
                    const existing = await Lead.findOne({ phone: cleanPhone });

                    if (!existing) {
                        const newLead = new Lead({
                            name,
                            phone: cleanPhone,
                            rating,
                            reviews,
                            website,
                            mapsLink,
                            status: "Not Called",
                        });
                        await newLead.save();
                        count++;
                    }


                }
                // Cleanup file
                fs.unlinkSync(req.file.path);
                res.json({ msg: "CSV Processed", leadsAdded: count });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
};
