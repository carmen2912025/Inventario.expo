import Constants from 'expo-constants';

// API base URL for REST requests
export const API_BASE_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3000';
