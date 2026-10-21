import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach Bearer JWT token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('elevai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Standardize errors and handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('elevai_token');
    }
    const formattedError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
    };
    return Promise.reject(formattedError);
  }
);

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const checkAIStatusApi = async () => {
  const response = await api.get('/health/ai-status');
  return response.data;
};

// Auth API Calls
export const loginApi = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logoutApi = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// Profile API Calls
export const getProfileApi = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const updateProfileApi = async (profileData) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

// Career Goal API Calls
export const getCareerGoalApi = async () => {
  const response = await api.get('/career-goal');
  return response.data;
};

export const createCareerGoalApi = async (goalData) => {
  const response = await api.post('/career-goal', goalData);
  return response.data;
};

export const updateCareerGoalApi = async (goalData) => {
  const response = await api.put('/career-goal', goalData);
  return response.data;
};

export const deleteCareerGoalApi = async () => {
  const response = await api.delete('/career-goal');
  return response.data;
};

// Resume API Calls
export const uploadResumeApi = async (formData) => {
  const response = await api.post('/resumes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getResumesApi = async () => {
  const response = await api.get('/resumes');
  return response.data;
};

export const getResumeByIdApi = async (id) => {
  const response = await api.get(`/resumes/${id}`);
  return response.data;
};

export const deleteResumeApi = async (id) => {
  const response = await api.delete(`/resumes/${id}`);
  return response.data;
};

export const getResumeDownloadUrlApi = async (id) => {
  const response = await api.get(`/resumes/${id}/download`);
  return response.data;
};

// AI Resume Analysis API Calls (Resume Analyzer)
export const analyzeResumeApi = async (resumeId) => {
  const response = await api.post(`/resumes/${resumeId}/analyze`);
  return response.data;
};

export const getResumeAnalysesApi = async (resumeId) => {
  const response = await api.get(`/resumes/${resumeId}/analyses`);
  return response.data;
};

export const getAnalysisByIdApi = async (analysisId) => {
  const response = await api.get(`/analyses/${analysisId}`);
  return response.data;
};

// AI Resume vs Job Analysis API Calls
export const createJobOptimizationApi = async (payload) => {
  const response = await api.post('/job-optimization', payload);
  return response.data;
};

export const getJobOptimizationsApi = async () => {
  const response = await api.get('/job-optimization');
  return response.data;
};

export const getJobOptimizationByIdApi = async (id) => {
  const response = await api.get(`/job-optimization/${id}`);
  return response.data;
};

export const deleteJobOptimizationApi = async (id) => {
  const response = await api.delete(`/job-optimization/${id}`);
  return response.data;
};

// Text-based AI Mock Interview API Calls
export const startInterviewApi = async (payload) => {
  const response = await api.post('/interviews', payload);
  return response.data;
};

export const submitAnswerApi = async (sessionId, questionId, payload) => {
  const response = await api.post(`/interviews/${sessionId}/questions/${questionId}/answer`, payload);
  return response.data;
};

export const getInterviewsApi = async () => {
  const response = await api.get('/interviews');
  return response.data;
};

export const getInterviewByIdApi = async (id) => {
  const response = await api.get(`/interviews/${id}`);
  return response.data;
};

export const abandonInterviewApi = async (sessionId) => {
  const response = await api.post(`/interviews/${sessionId}/abandon`);
  return response.data;
};

// Notification API Calls
export const getNotificationsApi = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const getUnreadNotificationCountApi = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const markNotificationAsReadApi = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsReadApi = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

export const deleteNotificationApi = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export const getNotificationPreferencesApi = async () => {
  const response = await api.get('/notification-preferences');
  return response.data;
};

export const updateNotificationPreferencesApi = async (data) => {
  const response = await api.put('/notification-preferences', data);
  return response.data;
};

// Admin API Calls
export const getAdminOverviewApi = async () => {
  const response = await api.get('/admin/overview');
  return response.data;
};

export const getAdminUsersApi = async (params) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

// Admin Job Management API Calls
export const createAdminJobApi = async (payload) => {
  const response = await api.post('/admin/jobs', payload);
  return response.data;
};

export const getAdminJobsApi = async (params) => {
  const response = await api.get('/admin/jobs', { params });
  return response.data;
};

export const getAdminJobByIdApi = async (id) => {
  const response = await api.get(`/admin/jobs/${id}`);
  return response.data;
};

export const updateAdminJobApi = async (id, payload) => {
  const response = await api.put(`/admin/jobs/${id}`, payload);
  return response.data;
};

export const updateAdminJobStatusApi = async (id, status) => {
  const response = await api.patch(`/admin/jobs/${id}/status`, { status });
  return response.data;
};

export const deleteAdminJobApi = async (id) => {
  const response = await api.delete(`/admin/jobs/${id}`);
  return response.data;
};

// Public / Candidate Published Jobs API
export const getPublicJobsApi = async (params) => {
  const response = await api.get('/jobs', { params });
  return response.data;
};

export const getPublicJobByIdApi = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

// Candidate Job Applications API
export const submitApplicationApi = async (payload) => {
  const response = await api.post('/applications', payload);
  return response.data;
};

export const getUserApplicationsApi = async (params) => {
  const response = await api.get('/applications', { params });
  return response.data;
};

export const checkJobApplicationStatusApi = async (jobId) => {
  const response = await api.get(`/applications/check/${jobId}`);
  return response.data;
};

export const getUserApplicationByIdApi = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};

// Admin Candidate Applications Review API
export const getAdminApplicationsApi = async (params) => {
  const response = await api.get('/admin/applications', { params });
  return response.data;
};

export const getAdminApplicationByIdApi = async (id) => {
  const response = await api.get(`/admin/applications/${id}`);
  return response.data;
};

export const updateApplicationStatusApi = async (id, payload) => {
  const response = await api.patch(`/admin/applications/${id}/status`, payload);
  return response.data;
};

export const addAdminNoteApi = async (applicationId, payload) => {
  const response = await api.post(`/admin/applications/${applicationId}/notes`, payload);
  return response.data;
};

export const deleteAdminNoteApi = async (noteId) => {
  const response = await api.delete(`/admin/applications/notes/${noteId}`);
  return response.data;
};

export const getAdminGlobalStatsApi = async (params) => {
  const response = await api.get('/admin/applications/stats', { params });
  return response.data;
};

export const getAdminActivityFeedApi = async (params) => {
  const response = await api.get('/admin/activity-feed', { params });
  return response.data;
};

export const getJobApplicationStatsApi = async (jobId) => {
  const response = await api.get(`/admin/jobs/${jobId}/application-stats`);
  return response.data;
};

export const getAdminResumeSecureUrlApi = async (resumeId) => {
  const response = await api.get(`/admin/resumes/${resumeId}/secure-url`);
  return response.data;
};

// Admin Recruitment Analytics Engine API
export const getAdminAnalyticsOverviewApi = async () => {
  const response = await api.get('/admin/analytics/overview');
  return response.data;
};

export const getAdminAnalyticsTrendsApi = async (params = {}) => {
  const response = await api.get('/admin/analytics/trends', { params });
  return response.data;
};

export const getAdminAnalyticsJobPerformanceApi = async (params = {}) => {
  const response = await api.get('/admin/analytics/job-performance', { params });
  return response.data;
};

export const getAdminAnalyticsSkillsApi = async (params = {}) => {
  const response = await api.get('/admin/analytics/skills', { params });
  return response.data;
};

export const getAdminAnalyticsDeadlinesApi = async () => {
  const response = await api.get('/admin/analytics/deadlines');
  return response.data;
};

export const getAdminAnalyticsInsightsApi = async () => {
  const response = await api.get('/admin/analytics/insights');
  return response.data;
};

export default api;
