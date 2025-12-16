# Google OAuth Setup Instructions

To enable Google authentication, follow these steps:

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`
   - Add test users if needed (for testing before verification)
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: Peer Help Platform (or your preferred name)
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret**

## 2. Update Environment Variables

Update your `.env` file with the credentials:

```
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

## 3. For Production

When deploying to production:

1. Add your production URL to **Authorized JavaScript origins**
2. Add your production callback URL to **Authorized redirect URIs**
   - Example: `https://yourdomain.com/api/auth/callback/google`
3. Update `NEXTAUTH_URL` in your production environment variables
4. Consider submitting your app for verification if you need to support more than 100 users

## 4. Test

1. Restart your development server
2. Go to the login page
3. Click "Continue with Google"
4. You should be redirected to Google's sign-in page

## Notes

- The app will work without Google OAuth (email/password still works)
- Google OAuth is optional but recommended for better user experience
- Make sure to keep your Client Secret secure and never commit it to version control

