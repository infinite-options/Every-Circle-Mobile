// API Configuration - Centralized location for all API endpoints
// Uncomment the appropriate line for your environment

// Production/Development Environment
export const API_BASE_URL = "https://o7t5ikn907.execute-api.us-west-1.amazonaws.com/dev";

// Local Development (commented out by default)
// export const API_BASE_URL = "http://localhost:4090";

// Google and Apple Authentication Endpoints
export const GOOGLE_SIGNUP_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialSignUp/EVERY-CIRCLE";
export const GOOGLE_SIGNIN_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialLogin/EVERY-CIRCLE";
export const APPLE_SIGNIN_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AppleLogin/EVERY-CIRCLE";

// Legacy API Base URL (infiniteoptions domain)
export const LEGACY_API_BASE_URL = "https://ioec2ecaspm.infiniteoptions.com";

// Account Management Endpoints
export const ACCOUNT_SALT_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AccountSalt/EVERY-CIRCLE";
export const CREATE_ACCOUNT_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/CreateAccount/EVERY-CIRCLE";
export const LOGIN_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/Login/EVERY-CIRCLE";
export const UPDATE_EMAIL_PASSWORD_ENDPOINT = "https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UpdateEmailPassword/EVERY-CIRCLE";

// Stripe Payment Endpoints
export const STRIPE_KEY_ENDPOINT = 'https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/stripe_key/ECTEST';
export const CREATE_PAYMENT_INTENT_ENDPOINT = 'https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createPaymentIntent';

// User Profile Endpoints
export const USER_PROFILE_INFO_ENDPOINT = `${LEGACY_API_BASE_URL}/api/v1/userprofileinfo`;
export const REFERRAL_API_ENDPOINT = `${LEGACY_API_BASE_URL}/api/v1/userprofileinfo/`;

// Business Endpoints
export const BUSINESS_INFO_ENDPOINT = `${LEGACY_API_BASE_URL}/api/v1/businessinfo`;
export const BUSINESSES_ENDPOINT = `${LEGACY_API_BASE_URL}/businesses`;
export const CATEGORY_LIST_ENDPOINT = `${LEGACY_API_BASE_URL}/category_list/all`;

// Search and Network Endpoints
export const BUSINESS_RESULTS_ENDPOINT = `${LEGACY_API_BASE_URL}/api/businessresults`;
export const BOUNTY_RESULTS_ENDPOINT = `${LEGACY_API_BASE_URL}/api/bountyresults`;
export const TAG_SEARCH_DISTINCT_ENDPOINT = `${LEGACY_API_BASE_URL}/api/tagsearchdistinct`;
export const TAG_CATEGORY_DISTINCT_ENDPOINT = `${LEGACY_API_BASE_URL}/api/tagcategorydistinct`;

// Transaction and Rating Endpoints
export const TRANSACTIONS_ENDPOINT = `${LEGACY_API_BASE_URL}/api/v1/transactions`;
export const RATINGS_ENDPOINT = `${LEGACY_API_BASE_URL}/ratings`;

console.log("API Configuration loaded:");
console.log("Base URL:", API_BASE_URL);
console.log("Legacy Base URL:", LEGACY_API_BASE_URL);
console.log("Google Signup:", GOOGLE_SIGNUP_ENDPOINT);
console.log("Google Signin:", GOOGLE_SIGNIN_ENDPOINT);
console.log("Apple Signin:", APPLE_SIGNIN_ENDPOINT);
console.log("Stripe Key:", STRIPE_KEY_ENDPOINT);
console.log("Payment Intent:", CREATE_PAYMENT_INTENT_ENDPOINT);
