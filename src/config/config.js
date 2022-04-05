const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({path: path.join(__dirname, '../../.env')});

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    FB_API_KEY: Joi.string().required().description('Firebase API key'),
    FB_AUTH_DOMAIN: Joi.string().required().description('Firebase Auth domain'),
    FB_DATABASE_URL: Joi.string().required().description('Firebase database URL'),
    FB_PROJECT_ID: Joi.string().required().description('Firebase project ID'),
    FB_STORAGE_BUCKET: Joi.string().required().description('Firebase storage bucket'),
    FB_MESSAGING_SENDER_ID: Joi.string().required().description('Firebase messaging sender ID'),
    FB_APP_ID: Joi.string().required().description('Firebase app ID'),
    FB_MEASUREMENT_ID: Joi.string().required().description('Firebase measurement ID'),
    ADMIN_EMAILS: Joi.string().required().description('Admin emails'),
    FB_ADMIN_DB_URL: Joi.string().required().description('Firebase admin database URL'),
  })
  .unknown();

const {value: envVars, error} = envVarsSchema.prefs({errors: {label: 'key'}}).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwt: {
    secret: envVars.JWT_SECRET,
  },
  firebaseConfigs: {
    apiKey: envVars.FB_API_KEY,
    authDomain: envVars.FB_AUTH_DOMAIN,
    databaseURL: envVars.FB_DATABASE_URL,
    projectId: envVars.FB_PROJECT_ID,
    storageBucket: envVars.FB_STORAGE_BUCKET,
    messagingSenderId: envVars.FB_MESSAGING_SENDER_ID,
    appId: envVars.FB_APP_ID,
    measurementId: envVars.FB_MEASUREMENT_ID,
  },
  firebaseAdminDB: envVars.FB_ADMIN_DB_URL,
  adminEmails: envVars.ADMIN_EMAILS.split(','),
};
