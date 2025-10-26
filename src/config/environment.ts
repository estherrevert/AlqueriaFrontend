// Environment configuration
export const config = {
  development: {
    API_URL: 'https://api.alqueriaxuquer.com',
    API_BASE_URL: 'https://api.alqueriaxuquer.com'
  },
  production: {
    API_URL: 'https://api.alqueriaxuquer.com', 
    API_BASE_URL: 'https://api.alqueriaxuquer.com'
  },
  staging: {
    API_URL: 'https://api.gestionbodas.ovh',
    API_BASE_URL: 'https://api.gestionbodas.ovh'
  }
};

// Get current environment
const getEnvironment = () => {
  if (import.meta.env.DEV) return 'development';
  if (import.meta.env.PROD) return 'production';
  return 'staging';
};

export const getApiUrl = () => {
  const env = getEnvironment();
  return config[env].API_URL;
};

export const getApiBaseUrl = () => {
  const env = getEnvironment();
  return config[env].API_BASE_URL;
};
