// Type definitions for config
export interface Config {
  WEBHOOK_URL: string;
  AUTH_HEADER: {
    name: string;
    value: string;
  };
  API_TIMEOUT_MS: number;
}

// Environment variables with fallbacks for development
const config: Config = {
  // In a real production app, these would come from environment variables
  WEBHOOK_URL: 'http://localhost:5678/webhook/user-question',
  AUTH_HEADER: {
    name: 'admin',
    value: 'vyphamdata'
  },
  // Add timeout configuration
  API_TIMEOUT_MS: 300000, // 5 minutes
};

// Only log in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Loaded config:', config);
}

export default config; 