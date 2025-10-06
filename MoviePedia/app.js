const express = require('express');
const collection = require('./mongo');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const router = express.Router();

const app = express();
app.use(express.json());
app.use(cors());


// Generate JWT token
function generateToken(user) {
  const payload = {
    email: user.email,
    // Add any additional user data to the payload as needed
  };

  // Create and sign the token
  const token = jwt.sign(payload, 'secret-key', { expiresIn: '1h' });
  return token;
}

// Signup route
router.post('/sign-up', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Check if the username already exists in the database
    const existingUser = await collection.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists. Please choose a different username.' });
    }

    // Check if the email already exists in the database
    const existingEmail = await collection.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already exists. Please choose a different email.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    await collection.insertOne({ username, password: hashedPassword, email });

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/sign-up', (req, res) => {
    res.send('Signup form goes here'); // Replace with your signup form or redirect logic
  });
  
  module.exports = router;

app.listen(8000, () => {
  console.log('Server connected on port 8000');
});
