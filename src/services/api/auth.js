// services/authService.js
import axios from 'axios';
import { getOrCreateDeviceFingerprint } from '../../utils/fingerprint';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const authAPI = axios.create({
    baseURL: `${API_URL}/auth`,
});

// Add device fingerprint to all requests
authAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const deviceFingerprint = getOrCreateDeviceFingerprint();
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['x-device-fingerprint'] = deviceFingerprint;
    
    // If this is a login/register request, add fingerprint to data
    if (config.data && (config.url.includes('login') || config.url.includes('register') || config.url.includes('verify-otp'))) {
        config.data.deviceFingerprint = deviceFingerprint;
    }
    
    return config;
});

export const authService = {
    register: (userData) => {
        const deviceFingerprint = getOrCreateDeviceFingerprint();
        return authAPI.post('/register', { ...userData, deviceFingerprint });
    },
    
    login: (credentials) => {
        const deviceFingerprint = getOrCreateDeviceFingerprint();
        return authAPI.post('/login', { ...credentials, deviceFingerprint });
    },
    
    verifyOTP: (data) => {
        const deviceFingerprint = getOrCreateDeviceFingerprint();
        return authAPI.post('/verify-otp', { ...data, deviceFingerprint });
    },
    
    logout: () => {
        return authAPI.post('/logout').then(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('deviceFingerprint');
            localStorage.removeItem('fingerprintTimestamp');
        });
    },
    logoutAll : () => {
        return authAPI.post('/logout-all').then(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('deviceFingerprint');
            localStorage.removeItem('fingerprintTimestamp');
        });
    },
    
    getCurrentUser: () => authAPI.get('/me'),
    
    getActiveDevices: () => authAPI.get('/devices'),
    
    removeDevice: (deviceId) => authAPI.delete(`/devices/${deviceId}`),
};

export default authService;