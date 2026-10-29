export interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  givenName: string;
  familyName: string;
}

const ADMIN_USER_KEY = 'sna_admin_user_v2';
const ALLOWED_ADMIN_EMAILS_KEY = 'sna_allowed_admin_emails';

// Decode a Google ID token (JWT) to read the user profile without an extra API call.
const decodeIdToken = (token: string): GoogleUser | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(json);
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      givenName: payload.given_name,
      familyName: payload.family_name,
    };
  } catch {
    return null;
  }
};

// Allowed admin emails (comma-separated list from VITE_ADMIN_EMAILS env var).
// If empty, any Google-signed-in user is treated as admin (convenient for dev).
export const getAllowedAdminEmails = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ALLOWED_ADMIN_EMAILS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setAllowedAdminEmails = (emails: string[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ALLOWED_ADMIN_EMAILS_KEY, JSON.stringify(emails));
};

// Initialise allowed admin emails from env on first load.
export const initAllowedAdminEmails = (): void => {
  if (typeof window === 'undefined') return;
  const envEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  if (envEmails.length > 0 && getAllowedAdminEmails().length === 0) {
    setAllowedAdminEmails(envEmails);
  }
};

export const getSignedInAdmin = (): GoogleUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSignedInAdmin = (user: GoogleUser): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(
    new CustomEvent('sna_admin_auth_change', { detail: { isAdmin: true } })
  );
};

export const clearSignedInAdmin = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_USER_KEY);
  window.dispatchEvent(
    new CustomEvent('sna_admin_auth_change', { detail: { isAdmin: false } })
  );
};

export const isAdminAuthenticated = (): boolean => {
  const user = getSignedInAdmin();
  if (!user) return false;
  const allowed = getAllowedAdminEmails();
  if (allowed.length === 0) return true;
  return allowed.includes(user.email);
};

export const subscribeAdminAuth = (callback: (isAdmin: boolean) => void): (() => void) => {
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail && typeof custom.detail.isAdmin === 'boolean') {
      callback(custom.detail.isAdmin);
    } else {
      callback(isAdminAuthenticated());
    }
  };
  callback(isAdminAuthenticated());
  window.addEventListener('sna_admin_auth_change', handler);
  return () => window.removeEventListener('sna_admin_auth_change', handler);
};

// Process a Google ID token returned by Google OAuth into a GoogleUser profile.
export const processGoogleCredential = (idToken: string): GoogleUser | null => {
  return decodeIdToken(idToken);
};

export const signOutAdmin = (): void => {
  clearSignedInAdmin();
  // Revoke the Google OAuth2 session if the Google library is available.
  try {
    (window as any).google?.accounts?.oauth2?.revoke?.(
      import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      () => {}
    );
  } catch {
    // Ignore revocation errors.
  }
};
