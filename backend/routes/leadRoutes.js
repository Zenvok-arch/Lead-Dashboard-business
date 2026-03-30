const express = require('express');
const router = express.Router();
const multer = require('multer');
const leadController = require('../controllers/leadController');
const path = require('path');

// Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
router.get('/', leadController.getLeads);
router.post('/', leadController.createLead);
router.delete('/bulk', leadController.bulkDeleteLeads);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);
router.post('/upload', upload.single('csvFile'), leadController.uploadCSV);

module.exports = router;
