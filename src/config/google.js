/**
 * Google OAuth Configuration
 * ─────────────────────────────────────────────────────────
 * To enable Google Sign-In:
 *
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a project (or select an existing one)
 * 3. Navigate to APIs & Services → Credentials
 * 4. Click "Create Credentials" → "OAuth 2.0 Client ID"
 * 5. Choose "Web application", add http://localhost:5173
 *    to "Authorised JavaScript origins"
 * 6. Copy the Client ID and paste it below.
 *
 * The app works without a real Client ID — the Google button
 * will simply show an informational notice instead.
 */

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? 'YOUR_GOOGLE_CLIENT_ID';

/** Returns true when a real Client ID has been configured */
export const isGoogleConfigured = () =>
  GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' && GOOGLE_CLIENT_ID.length > 20;
