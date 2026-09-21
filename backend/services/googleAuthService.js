import { OAuth2Client } from 'google-auth-library';
import { environment } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

let oauthClientInstance = null;

const getOAuthClient = () => {
  if (!environment.googleClientId) {
    throw new ApiError(
      500,
      'Google OAuth is not configured on the server. Set GOOGLE_CLIENT_ID in your environment.'
    );
  }

  if (!oauthClientInstance) {
    oauthClientInstance = new OAuth2Client(environment.googleClientId);
  }

  return oauthClientInstance;
};

/**
 * Verifies a Google OpenID Connect ID token and extracts validated user claims.
 *
 * @param {string} idToken - The JWT credential returned by Google Identity Services.
 * @returns {Promise<{ googleId: string, email: string, name: string, picture: string, emailVerified: boolean }>}
 */
export const verifyGoogleIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== 'string') {
    throw new ApiError(400, 'A valid Google ID token is required.');
  }

  const client = getOAuthClient();

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: environment.googleClientId
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new ApiError(400, 'Invalid Google token payload: missing email.');
    }

    if (!payload.email_verified) {
      throw new ApiError(400, 'The Google account email is not verified.');
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase().trim(),
      name: payload.name?.trim() || payload.email.split('@')[0],
      picture: payload.picture || '',
      emailVerified: Boolean(payload.email_verified)
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      401,
      `Google authentication failed: ${error.message || 'invalid or expired token.'}`
    );
  }
};
