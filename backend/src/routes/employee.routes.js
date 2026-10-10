const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, employeeController.getAllEmployees);
router.get('/:id', verifyToken, employeeController.getEmployeeById);
router.post('/', verifyToken, requireRole(['Admin', 'Manager']), employeeController.createEmployee);
router.put('/:id', verifyToken, requireRole(['Admin', 'Manager']), employeeController.updateEmployee);
router.delete('/:id', verifyToken, requireRole(['Admin']), employeeController.deleteEmployee);

module.exports = router;
