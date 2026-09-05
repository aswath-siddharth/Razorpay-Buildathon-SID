// Centralized Configuration for Local and Production (Render) Environments

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TTbqDaKP2i6PmQ';
