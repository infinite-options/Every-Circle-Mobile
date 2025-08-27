// API Configuration - Centralized location for all API endpoints
// Uncomment the appropriate line for your environment

// Production/Development Environment
const API_BASE_URL = "https://o7t5ikn907.execute-api.us-west-1.amazonaws.com/dev";

// Local Development (commented out by default)
// const API_BASE_URL = "http://localhost:4090";

// Google and Apple Authentication Endpoints
const GOOGLE_SIGNUP_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialSignUp/EVERY-CIRCLE";
const GOOGLE_SIGNIN_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialLogin/EVERY-CIRCLE";
const APPLE_SIGNIN_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AppleLogin/EVERY-CIRCLE";

// Common API Paths (keep these in respective files for easier debugging)
// User Profile: /api/v1/userprofileinfo
// Business Info: /api/v1/businessinfo
// Business Search: /api/v1/business_search
// Category List: /category_list
// Tagsplit Search: /api/v1/tagsplitsearchdistinct
// Business Results: /api/businessresults
// General Search: /api/v1/search
// Businesses: /businesses

module.exports = {
  API_BASE_URL,
  GOOGLE_SIGNUP_ENDPOINT,
  GOOGLE_SIGNIN_ENDPOINT,
  APPLE_SIGNIN_ENDPOINT,
};
