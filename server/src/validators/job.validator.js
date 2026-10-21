/**
 * Job Input Validator for ElevAI Admin Recruitment Engine
 */

const VALID_WORK_MODES = ['REMOTE', 'HYBRID', 'ON_SITE'];
const VALID_EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'];
const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'CLOSED'];

function validateJobInput(data, isUpdate = false) {
  const errors = [];
  const sanitized = {};

  // Title
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
      errors.push('Job title must be at least 3 characters long');
    } else {
      sanitized.title = data.title.trim();
    }
  }

  // Company Name
  if (!isUpdate || data.companyName !== undefined) {
    if (!data.companyName || typeof data.companyName !== 'string' || data.companyName.trim().length < 2) {
      errors.push('Company name is required');
    } else {
      sanitized.companyName = data.companyName.trim();
    }
  }

  // Location
  if (!isUpdate || data.location !== undefined) {
    if (!data.location || typeof data.location !== 'string' || data.location.trim().length === 0) {
      errors.push('Location is required (e.g., Pune, Remote, New York)');
    } else {
      sanitized.location = data.location.trim();
    }
  }

  // Work Mode
  if (!isUpdate || data.workMode !== undefined) {
    const mode = (data.workMode || 'REMOTE').toUpperCase();
    if (!VALID_WORK_MODES.includes(mode)) {
      errors.push(`Invalid work mode. Allowed: ${VALID_WORK_MODES.join(', ')}`);
    } else {
      sanitized.workMode = mode;
    }
  }

  // Employment Type
  if (!isUpdate || data.employmentType !== undefined) {
    const empType = (data.employmentType || 'FULL_TIME').toUpperCase();
    if (!VALID_EMPLOYMENT_TYPES.includes(empType)) {
      errors.push(`Invalid employment type. Allowed: ${VALID_EMPLOYMENT_TYPES.join(', ')}`);
    } else {
      sanitized.employmentType = empType;
    }
  }

  // Experience Required
  if (!isUpdate || data.experienceRequired !== undefined) {
    if (!data.experienceRequired || typeof data.experienceRequired !== 'string' || data.experienceRequired.trim().length === 0) {
      errors.push('Experience requirement is required (e.g., 0-1 years, Fresher, 2-4 years)');
    } else {
      sanitized.experienceRequired = data.experienceRequired.trim();
    }
  }

  // Education Requirement
  if (data.educationRequirement !== undefined) {
    sanitized.educationRequirement = data.educationRequirement ? String(data.educationRequirement).trim() : null;
  }

  // Required Skills (Must be an array of strings, at least 1 item)
  if (!isUpdate || data.requiredSkills !== undefined) {
    let skills = data.requiredSkills;
    if (typeof skills === 'string') {
      skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(skills) || skills.length === 0) {
      errors.push('At least one required skill must be specified');
    } else {
      sanitized.requiredSkills = skills.map((s) => String(s).trim()).filter(Boolean);
    }
  }

  // Preferred Skills (Optional array)
  if (data.preferredSkills !== undefined) {
    let pref = data.preferredSkills;
    if (typeof pref === 'string') {
      pref = pref.split(',').map((s) => s.trim()).filter(Boolean);
    }
    sanitized.preferredSkills = Array.isArray(pref)
      ? pref.map((s) => String(s).trim()).filter(Boolean)
      : [];
  }

  // Salary Validation
  if (data.salaryMin !== undefined && data.salaryMin !== null && data.salaryMin !== '') {
    const min = parseInt(data.salaryMin, 10);
    if (isNaN(min) || min < 0) {
      errors.push('Minimum salary must be a positive number');
    } else {
      sanitized.salaryMin = min;
    }
  } else if (!isUpdate) {
    sanitized.salaryMin = null;
  }

  if (data.salaryMax !== undefined && data.salaryMax !== null && data.salaryMax !== '') {
    const max = parseInt(data.salaryMax, 10);
    if (isNaN(max) || max < 0) {
      errors.push('Maximum salary must be a positive number');
    } else {
      sanitized.salaryMax = max;
    }
  } else if (!isUpdate) {
    sanitized.salaryMax = null;
  }

  if (sanitized.salaryMin !== null && sanitized.salaryMax !== null && sanitized.salaryMin !== undefined && sanitized.salaryMax !== undefined) {
    if (sanitized.salaryMin > sanitized.salaryMax) {
      errors.push('Minimum salary cannot exceed maximum salary');
    }
  }

  if (data.salaryVisible !== undefined) {
    sanitized.salaryVisible = Boolean(data.salaryVisible);
  }

  // Description
  if (!isUpdate || data.description !== undefined) {
    if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
      errors.push('Job description must be at least 10 characters long');
    } else {
      sanitized.description = data.description.trim();
    }
  }

  // Openings
  if (!isUpdate || data.openings !== undefined) {
    const openings = parseInt(data.openings || '1', 10);
    if (isNaN(openings) || openings < 1) {
      errors.push('Number of openings must be at least 1');
    } else {
      sanitized.openings = openings;
    }
  }

  // Application Deadline
  if (data.applicationDeadline !== undefined) {
    if (data.applicationDeadline) {
      const date = new Date(data.applicationDeadline);
      if (isNaN(date.getTime())) {
        errors.push('Invalid application deadline date format');
      } else {
        sanitized.applicationDeadline = date;
      }
    } else {
      sanitized.applicationDeadline = null;
    }
  }

  // Status
  if (data.status !== undefined) {
    const status = String(data.status).toUpperCase();
    if (!VALID_STATUSES.includes(status)) {
      errors.push(`Invalid job status. Allowed: ${VALID_STATUSES.join(', ')}`);
    } else {
      sanitized.status = status;
      if (status === 'PUBLISHED' && !isUpdate) {
        sanitized.publishedAt = new Date();
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}

module.exports = {
  validateJobInput,
  VALID_WORK_MODES,
  VALID_EMPLOYMENT_TYPES,
  VALID_STATUSES,
};
