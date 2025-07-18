const User = require('../models/User');
const Expense = require('../models/Expense');

const bcrypt = require('bcryptjs');

// Create a new admin
exports.createAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating admin', error: err.message });
  }
};

// Get all normal users
// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find({ role: 'user' }).select('-password');
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching users', error: err.message });
//   }
// };

exports.getAllUsers = async (req, res) => {
  try {
    const usersWithExpenses = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $lookup: {
          from: 'expenses', // should match your actual collection name
          localField: '_id',
          foreignField: 'user',
          as: 'expenses'
        }
      },
      {
        $project: {
          password: 0,
          __v: 0,
          'expenses.__v': 0
        }
      }
    ]);

    res.json(usersWithExpenses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users with expenses', error: err.message });
  }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};


// Delete any user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};

// Update a user (name/role/age)
exports.updateUser = async (req, res) => {
  try {
    const { name, role, age } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (role !== undefined) updateFields.role = role;
    if (age !== undefined) updateFields.age = age;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};
