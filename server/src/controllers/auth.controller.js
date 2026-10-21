const bcrypt = require('bcryptjs');
const { getPrismaClient } = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { validateRegisterInput, validateLoginInput } = require('../validators/auth.validator');

async function register(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
      });
    }

    const { name, email, password, role } = sanitized;
    const prisma = getPrismaClient();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Hash password securely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with requested role ('ADMIN' or 'USER')
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      role: newUser.role,
      email: newUser.email,
    });

    // Return safe user information without passwordHash
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateLoginInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
      });
    }

    const { email, password, requestedRole } = sanitized;
    const prisma = getPrismaClient();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Role Validation: Check if requested persona matches actual account role
    if (requestedRole) {
      const isActualAdmin = user.role === 'ADMIN';
      if (requestedRole === 'RECRUITER' && !isActualAdmin) {
        return res.status(403).json({
          success: false,
          message: 'This account is registered as a Candidate. Please select "Candidate" to continue.',
        });
      }
      if (requestedRole === 'CANDIDATE' && isActualAdmin) {
        return res.status(403).json({
          success: false,
          message: 'This account is registered as a Recruiter. Please select "Recruiter" to continue.',
        });
      }
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const prisma = getPrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

module.exports = {
  register,
  login,
  getMe,
  logout,
};
