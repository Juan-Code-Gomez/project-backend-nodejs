const express = require('express');
const { addPatient, getPatients, exportPatientsToExcel } = require('../controllers/patientController')
const router = express.Router();

router.post('/patients', addPatient);
router.get('/patients', getPatients)
router.get('/patients/export', exportPatientsToExcel)

module.exports = router