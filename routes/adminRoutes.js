const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  createAdmin,
  updateUser,
  deleteUser
} = require('../controllers/adminController');

// console.log("authorizeRoles('admin') =>", typeof authorizeRoles('admin'));


// Route-level middleware for each route
router.get('/users', authenticate, authorizeRoles('admin'), getAllUsers);
router.post('/create-admin', authenticate, authorizeRoles('admin'), createAdmin);
router.delete('/users/:id', authenticate, authorizeRoles('admin'), deleteUser);
router.put('/users/:id', authenticate, authorizeRoles('admin'), updateUser);

module.exports = router;
