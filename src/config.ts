const config = {
  WEBHOOK_URL: process.env.WEBHOOK_URL || 'http://localhost:5678/webhook/user-question',
  AUTH_HEADER: {
    name: process.env.AUTH_NAME || 'admin',
    value: process.env.AUTH_VALUE || 'vyphamdata'
  }
};

console.log('Loaded config:', config);  // Debug log

export default config; 