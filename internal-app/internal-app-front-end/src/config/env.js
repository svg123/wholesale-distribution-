const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  appName: import.meta.env.VITE_APP_NAME || 'Central Command',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  enableMockApi: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  tokenKey: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'cc_auth_token',
  userKey: import.meta.env.VITE_USER_STORAGE_KEY || 'cc_auth_user',
};

export default config;
