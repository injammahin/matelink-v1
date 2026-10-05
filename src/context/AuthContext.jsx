import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

const AuthContext = createContext(null);

const USERS_STORAGE_KEY = 'matelink.customer.users.v1';
const SESSION_STORAGE_KEY = 'matelink.customer.session.v1';

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
|
| This is frontend/demo authentication.
| It is NOT a replacement for server-side authentication.
|
| We hash the password before putting it in localStorage so that the
| plain password is not stored directly.
|
*/

function normaliseEmail(email = '') {
  return email.trim().toLowerCase();
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `USR-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

async function hashPassword(password) {
  if (!globalThis.crypto?.subtle) {
    /*
     * Development fallback only.
     * Production authentication must happen on the backend.
     */
    return `demo-${window.btoa(
      encodeURIComponent(password)
    )}`;
  }

  const encoder = new TextEncoder();

  const data = encoder.encode(password);

  const hashBuffer =
    await globalThis.crypto.subtle.digest(
      'SHA-256',
      data
    );

  const hashArray = Array.from(
    new Uint8Array(hashBuffer)
  );

  return hashArray
    .map((byte) =>
      byte.toString(16).padStart(2, '0')
    )
    .join('');
}

function loadUsers() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(USERS_STORAGE_KEY) || '[]'
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify(users)
  );
}

function loadSession() {
  try {
    const session = JSON.parse(
      localStorage.getItem(SESSION_STORAGE_KEY)
    );

    if (!session?.userId) {
      return null;
    }

    const users = loadUsers();

    return (
      users.find(
        (user) => user.id === session.userId
      ) || null
    );
  } catch {
    return null;
  }
}

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
*/

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession);

  /*
  |--------------------------------------------------------------------------
  | Register
  |--------------------------------------------------------------------------
  */

  async function register({
    name,
    email,
    mobile = '',
    password,
  }) {
    const cleanName = name.trim();
    const cleanEmail = normaliseEmail(email);
    const cleanMobile = mobile.trim();

    if (!cleanName) {
      throw new Error(
        'Please enter your full name.'
      );
    }

    if (!cleanEmail) {
      throw new Error(
        'Please enter your email address.'
      );
    }

    if (password.length < 8) {
      throw new Error(
        'Your password must be at least 8 characters.'
      );
    }

    const users = loadUsers();

    const alreadyExists = users.some(
      (existingUser) =>
        normaliseEmail(existingUser.email) ===
        cleanEmail
    );

    if (alreadyExists) {
      throw new Error(
        'An account already exists with this email address.'
      );
    }

    const passwordHash =
      await hashPassword(password);

    const newUser = {
      id: createId(),

      name: cleanName,

      email: cleanEmail,

      mobile: cleanMobile,

      passwordHash,

      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [
      newUser,
      ...users,
    ];

    saveUsers(updatedUsers);

    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        userId: newUser.id,
      })
    );

    setUser(newUser);

    return newUser;
  }

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  async function login({
    email,
    password,
  }) {
    const cleanEmail =
      normaliseEmail(email);

    const users = loadUsers();

    const foundUser = users.find(
      (existingUser) =>
        normaliseEmail(existingUser.email) ===
        cleanEmail
    );

    if (!foundUser) {
      throw new Error(
        'We could not find an account with that email address.'
      );
    }

    const passwordHash =
      await hashPassword(password);

    if (
      passwordHash !==
      foundUser.passwordHash
    ) {
      throw new Error(
        'The password you entered is incorrect.'
      );
    }

    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        userId: foundUser.id,
      })
    );

    setUser(foundUser);

    return foundUser;
  }

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  function logout() {
    localStorage.removeItem(
      SESSION_STORAGE_KEY
    );

    setUser(null);
  }

  /*
  |--------------------------------------------------------------------------
  | Update user
  |--------------------------------------------------------------------------
  */

  function updateUser(values) {
    if (!user) {
      return null;
    }

    const users = loadUsers();

    const updatedUser = {
      ...user,
      ...values,

      email:
        values.email !== undefined
          ? normaliseEmail(values.email)
          : user.email,
    };

    const updatedUsers = users.map(
      (existingUser) =>
        existingUser.id === user.id
          ? updatedUser
          : existingUser
    );

    saveUsers(updatedUsers);

    setUser(updatedUser);

    return updatedUser;
  }

  const value = useMemo(
    () => ({
      user,

      isAuthenticated: Boolean(user),

      register,

      login,

      logout,

      updateUser,
    }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| Hook
|--------------------------------------------------------------------------
*/

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.'
    );
  }

  return context;
}