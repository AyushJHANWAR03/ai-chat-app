import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, profilePic } = req.body;

    // Check if user exists
    let user = await User.findOne({ googleId });

    if (!user) {
      // Create new user if not found
      user = await User.create({
        googleId,
        email,
        name,
        profilePic
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data and token
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      message: 'Error during Google authentication',
      error: error.message
    });
  }
}; 