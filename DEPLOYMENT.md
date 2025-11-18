# Deployment Instructions for Vercel

## Environment Variables Setup

To deploy this application to Vercel, you need to configure the following environment variable:

### Required Environment Variable

- **`VITE_API_URL`**: The base URL for your backend API

  **Value**: `https://iit-backend-z5o6.vercel.app/api`

## How to Set Environment Variables in Vercel

### Method 1: Using Vercel Dashboard

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add the following:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://iit-backend-z5o6.vercel.app/api`
   - **Environment**: Select all environments (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application for changes to take effect

### Method 2: Using Vercel CLI

```bash
vercel env add VITE_API_URL
# When prompted, enter: https://iit-backend-z5o6.vercel.app/api
# Select all environments
```

## Local Development

For local development, create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

**Note**: The `.env` file is gitignored and should not be committed to the repository.

## Verification

After deployment, your app should:
- Connect to the production backend at `https://iit-backend-z5o6.vercel.app`
- Not attempt to connect to `localhost:5000` in production

## Troubleshooting

If the app is still connecting to localhost after deployment:
1. Verify the environment variable is set correctly in Vercel
2. Trigger a new deployment (don't use the cached build)
3. Check browser console for the API calls being made
4. Clear browser cache and try again

