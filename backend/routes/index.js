const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const adminController = require('../controllers/admin');

// auth routes
router.post('/create_admin', authController.createAdmin);
router.post('/login', authController.login);
router.get('/auth', authController.verifyToken, authController.sendResponse);
router.get('/refresh', authController.refreshToken);
router.delete('/logout', authController.logout);

// admin routes
router.get('/students', authController.verifyToken, adminController.checkIfAdmin, adminController.getStudents);
router.get('/teachers', authController.verifyToken, adminController.checkIfAdmin, adminController.getTeachers);
router.post('/add_teacher', authController.verifyToken, adminController.checkIfAdmin, adminController.addTeacher);
router.post('/add_student', authController.verifyToken, adminController.checkIfAdmin, adminController.addStudent);

module.exports = router;