const config = {
  WEBHOOK_URL: 'http://localhost:5678/webhook/user-question',
  AUTH_HEADER: {
    name: 'admin',
    value: 'vyphamdata'
  }
};

console.log('Loaded config:', config);  // Debug log

export default config; 