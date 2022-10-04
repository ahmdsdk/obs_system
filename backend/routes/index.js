const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const adminController = require('../controllers/admin');

// auth routes
router.post('/create_admin', authController.createAdmin);
router.post('/login', authController.login);
router.get('/auth', authController.verifyToken, authController.sendResponse);
router.put('/change_password', authController.verifyToken, authController.changePassword);
router.get('/refresh', authController.refreshToken);
router.delete('/logout', authController.logout);

// admin routes
router.get('/teachers', authController.verifyToken, adminController.checkIfAdminOrTeacher, adminController.getTeachers);
router.get('/students', authController.verifyToken, adminController.checkIfAdminOrTeacher, adminController.getStudents);
router.get('/lessons', authController.verifyToken, adminController.getLessons);
router.post('/add_teacher', authController.verifyToken, adminController.checkIfAdmin, adminController.addTeacher);
router.post('/add_student', authController.verifyToken, adminController.checkIfAdmin, adminController.addStudent);
router.post('/add_lesson', authController.verifyToken, adminController.checkIfAdminOrTeacher, adminController.addLesson);

module.exports = router;