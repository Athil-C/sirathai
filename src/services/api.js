import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('siratai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('siratai_token');
      localStorage.removeItem('siratai_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Paths
export const getPaths = () => API.get('/paths');
export const getPathBySlug = (slug) => API.get(`/paths/${slug}`);

// Lessons
export const getLesson = (id) => API.get(`/lessons/${id}`);

// Progress
export const getDashboard = () => API.get('/progress/dashboard');
export const updateStep = (lessonId, data) => API.post(`/progress/${lessonId}/step`, data);
export const getProgress = (lessonId) => API.get(`/progress/${lessonId}`);

// Community
export const getCommunityPosts = (community, page) => API.get(`/community/${community}/posts?page=${page}`);
export const createPost = (community, data) => API.post(`/community/${community}/posts`, data);
export const evaluatePost = (postId, data) => API.post(`/community/posts/${postId}/evaluate`, data);
export const likePost = (postId) => API.post(`/community/posts/${postId}/like`);
export const getComments = (postId) => API.get(`/community/posts/${postId}/comments`);
export const addComment = (postId, data) => API.post(`/community/posts/${postId}/comments`, data);
export const getMuftiPending = () => API.get('/community/mufti/pending');
export const editPost = (postId, data) => API.put(`/community/posts/${postId}`, data);
export const deletePost = (postId) => API.delete(`/community/posts/${postId}`);

// Gamification
export const getStats = () => API.get('/gamification/stats');
export const getAchievements = () => API.get('/gamification/achievements');
export const checkAchievements = () => API.post('/gamification/check-achievements');

// Users
export const getLeaderboard = (period) => API.get(`/users/leaderboard?period=${period}`);
export const updateProfile = (data) => API.put('/users/profile', data);
export const getUsers = (params) => API.get('/users', { params });

// Admin Management
export const adminCreateUser = (data) => API.post('/admin/users', data);
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);
export const adminUserStatus = (id, data) => API.put(`/admin/users/${id}/status`, data);
export const adminCreateLesson = (data) => API.post('/admin/lessons', data);
export const adminUpdateLesson = (id, data) => API.put(`/admin/lessons/${id}`, data);
export const adminDeleteLesson = (id) => API.delete(`/admin/lessons/${id}`);
export const adminCreatePath = (data) => API.post('/admin/paths', data);
export const adminUpdatePath = (id, data) => API.put(`/admin/paths/${id}`, data);
export const adminDeletePath = (id) => API.delete(`/admin/paths/${id}`);
export const adminGetReports = (status) => API.get('/admin/reports', { params: { status } });
export const adminReviewReport = (id, data) => API.put(`/admin/reports/${id}`, data);
export const adminGetAllLessons = (pathSlug) => API.get('/admin/all-lessons', { params: { pathSlug } });
export const adminGetAllPaths = () => API.get('/admin/all-paths');

// Reports (student)
export const submitReport = (data) => API.post('/admin/reports', data);

// Messaging
export const getConversations = () => API.get('/mufti/conversations');
export const startConversation = (data) => API.post('/mufti/conversations', data);
export const getMessages = (convoId) => API.get(`/mufti/conversations/${convoId}/messages`);
export const sendMessage = (convoId, data) => API.post(`/mufti/conversations/${convoId}/messages`, data);
export const getAvailableMuftis = () => API.get('/mufti/muftis');

// Grading
export const getMuftiStudents = () => API.get('/mufti/students');
export const assignGrade = (data) => API.post('/mufti/grades', data);
export const getStudentGrades = (studentId) => API.get(`/mufti/grades/${studentId}`);

// Daily Goal / Progress
export const incrementStudyTime = (minutes) => API.post('/progress/study-time', { minutes });
export const claimDailyBonus = () => API.post('/progress/claim-daily-bonus');

export default API;
