# Google OAuth Setup Guide

## Quick Setup

1. **Create a `.env` file** in the `client/frontendnew/` directory (copy from `env.example`)

2. **Get Google OAuth Client ID:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the **Google Identity API** (or Google+ API)
   - Navigate to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth client ID**
   - Choose **Web application** as the application type
   - Add authorized redirect URI: `http://localhost:8080/auth/google/callback`
   - Copy the **Client ID** (not the secret - we don't need it for this flow)

3. **Add to `.env` file:**
   ```env
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   ```

4. **Restart your dev server** after adding the environment variable:
   ```bash
   npm run dev
   ```

## Important Notes

- The `.env` file is gitignored and won't be committed to the repository
- Make sure the redirect URI in Google Console **exactly matches** `http://localhost:8080/auth/google/callback`
- For production, add your production URL to authorized redirect URIs
- Google deprecated the implicit flow (`response_type=id_token`) for web apps, but it may still work for some configurations

## Troubleshooting

- **"Google OAuth is not configured"**: Make sure `VITE_GOOGLE_CLIENT_ID` is set in `.env` and you've restarted the dev server
- **"redirect_uri_mismatch"**: Check that the redirect URI in Google Console matches exactly
- **"No ID token received"**: Check browser console for detailed error messages

