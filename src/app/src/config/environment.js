/**
 * Environment configuration validator
 * Ensures all required environment variables are present
 */

export function validateEnvironment() {
    const required = [
        'NEXT_PUBLIC_API_BASE_URL'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing);
        console.error('Please check your .env.local file');
        return false;
    }

    // Log current configuration (helpful for debugging)
    console.log('Environment Configuration:');
    console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('Environment:', process.env.NEXT_PUBLIC_APP_ENV || 'development');

    return true;
}