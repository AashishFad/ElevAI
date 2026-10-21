/**
 * Validate and sanitize registration inputs
 */
function validateRegisterInput({ name, email, password, role, requestedRole, persona, roleType } = {}) {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }

  const normalizedEmail = email ? String(email).trim().toLowerCase() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    errors.push('A valid email address is required');
  } else if (normalizedEmail.length > 255) {
    errors.push('Email address cannot exceed 255 characters');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  } else if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  const rawRole = role || requestedRole || persona || roleType;
  let normalizedRole = 'USER';
  if (rawRole && typeof rawRole === 'string') {
    const upper = rawRole.trim().toUpperCase();
    if (['ADMIN', 'RECRUITER'].includes(upper)) {
      normalizedRole = 'ADMIN';
    } else if (['USER', 'STUDENT', 'CANDIDATE'].includes(upper)) {
      normalizedRole = 'USER';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      name: name ? name.trim() : '',
      email: normalizedEmail,
      password,
      role: normalizedRole,
    },
  };
}

/**
 * Validate and sanitize login inputs
 */
/**
 * Validate and sanitize login inputs
 */
function validateLoginInput({ email, password, requestedRole, role, persona, loginAs } = {}) {
  const errors = [];

  const normalizedEmail = email ? String(email).trim().toLowerCase() : '';
  if (!normalizedEmail) {
    errors.push('Email is required');
  } else if (normalizedEmail.length > 255) {
    errors.push('Email address cannot exceed 255 characters');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  const rawRole = requestedRole || role || persona || loginAs;
  let normalizedRole;
  if (rawRole && typeof rawRole === 'string') {
    const upper = rawRole.trim().toUpperCase();
    if (upper === 'ADMIN' || upper === 'RECRUITER') {
      normalizedRole = 'RECRUITER';
    } else if (upper === 'USER' || upper === 'STUDENT' || upper === 'CANDIDATE') {
      normalizedRole = 'CANDIDATE';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      email: normalizedEmail,
      password,
      requestedRole: normalizedRole,
    },
  };
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};

