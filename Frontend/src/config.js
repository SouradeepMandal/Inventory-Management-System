// Central API configuration
// Set REACT_APP_API_URL in your .env file for production deployment.
// Example: REACT_APP_API_URL=https://your-backend.vercel.app
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default API_BASE_URL;
