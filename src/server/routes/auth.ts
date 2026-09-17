import { Router, Request, Response } from 'express';
import argon2 from 'argon2';
import * as otplib from 'otplib';
import crypto from 'crypto';
import { activeSessions, userLockouts, authenticateSession } from '../middleware/auth';

export const authRouter = Router();

// Hashed user records using Argon2id
const SERVER_USERS: Record<string, any> = {};

// Synchronous promise cache for initialized user hashes
const userInitPromise = (async () => {
  SERVER_USERS['admin@polycarpe.eduka.ht'] = {
    id: 'usr-admin',
    email: 'admin@polycarpe.eduka.ht',
    passwordHash: await argon2.hash('AdminPass2025!', { type: argon2.argon2id }),
    firstName: 'Jean-Baptiste',
    lastName: 'Salnave',
    role: 'admin',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3700-0001',
    mfaEnabled: true,
    mfaSecret: otplib.generateSecret(),
    status: 'active',
  };

  SERVER_USERS['direction@polycarpe.eduka.ht'] = {
    id: 'usr-direction',
    email: 'direction@polycarpe.eduka.ht',
    passwordHash: await argon2.hash('Direction2025!', { type: argon2.argon2id }),
    firstName: 'Sœur Marie-Claire',
    lastName: 'Auguste',
    role: 'direction',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3700-0002',
    mfaEnabled: true,
    mfaSecret: otplib.generateSecret(),
    status: 'active',
  };

  SERVER_USERS['j.etienne@polycarpe.eduka.ht'] = {
    id: 'usr-prof-etienne',
    email: 'j.etienne@polycarpe.eduka.ht',
    passwordHash: await argon2.hash('Teacher2025!', { type: argon2.argon2id }),
    firstName: 'Jacques',
    lastName: 'Étienne',
    role: 'enseignant',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3600-1122',
    mfaEnabled: false,
    status: 'active',
  };

  SERVER_USERS['finance@polycarpe.eduka.ht'] = {
    id: 'usr-comptable',
    email: 'finance@polycarpe.eduka.ht',
    passwordHash: await argon2.hash('Finance2025!', { type: argon2.argon2id }),
    firstName: 'Gérard',
    lastName: 'Vilaire',
    role: 'comptable',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3700-0004',
    mfaEnabled: true,
    mfaSecret: otplib.generateSecret(),
    status: 'active',
  };

  SERVER_USERS['jr.celestin@gmail.com'] = {
    id: 'usr-parent-celestin',
    email: 'jr.celestin@gmail.com',
    passwordHash: await argon2.hash('Parent2025!', { type: argon2.argon2id }),
    firstName: 'Jean-Robert',
    lastName: 'Célestin',
    role: 'parent',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3712-4455',
    mfaEnabled: false,
    status: 'active',
  };

  SERVER_USERS['m.celestin@student.eduka.ht'] = {
    id: 'usr-eleve-celestin',
    email: 'm.celestin@student.eduka.ht',
    passwordHash: await argon2.hash('Student2025!', { type: argon2.argon2id }),
    firstName: 'Marc-Alain',
    lastName: 'Célestin',
    role: 'eleve',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3712-4455',
    mfaEnabled: false,
    status: 'active',
  };

  SERVER_USERS['superadmin@eduka.ht'] = {
    id: 'usr-superadmin',
    email: 'superadmin@eduka.ht',
    passwordHash: await argon2.hash('SuperAdmin2025!', { type: argon2.argon2id }),
    firstName: 'Alexandre',
    lastName: 'Pétion-Laraque',
    role: 'super_admin',
    organizationId: 'org-saint-marc',
    schoolId: 'school-polycarpe',
    phone: '+509 3100-0000',
    mfaEnabled: true,
    mfaSecret: otplib.generateSecret(),
    status: 'active',
  };
})();

// Login Route
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  await userInitPromise;

  const { email, password, codeMfa } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Email et mot de passe requis.' } });
    return;
  }

  const lockout = userLockouts.get(email.toLowerCase());
  if (lockout && lockout.lockedUntil && lockout.lockedUntil > new Date()) {
    res.status(429).json({ error: { code: 'ACCOUNT_LOCKED', message: 'Compte temporairement verrouillé suite à plusieurs échecs. Réessayez plus tard.' } });
    return;
  }

  const user = SERVER_USERS[email.toLowerCase()];
  if (!user) {
    res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Identifiants invalides.' } });
    return;
  }

  const isValidPassword = await argon2.verify(user.passwordHash, password);
  if (!isValidPassword) {
    const currentAttempts = (lockout?.attempts || 0) + 1;
    let lockedUntil: Date | undefined;
    if (currentAttempts >= 5) {
      lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
    }
    userLockouts.set(email.toLowerCase(), { attempts: currentAttempts, lockedUntil });

    res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Identifiants invalides.' } });
    return;
  }

  // Clear lockouts on success
  userLockouts.delete(email.toLowerCase());

  // MFA check
  if (user.mfaEnabled) {
    if (!codeMfa) {
      res.status(202).json({
        mfaRequired: true,
        message: 'Authentification à deux facteurs requise.',
      });
      return;
    }

    const isValidOtp = otplib.verify({ token: codeMfa, secret: user.mfaSecret });
    if (!isValidOtp) {
      res.status(401).json({ error: { code: 'INVALID_MFA', message: 'Code MFA TOTP invalide ou expiré.' } });
      return;
    }
  }

  // Generate Session Token
  const token = crypto.randomBytes(32).toString('hex');
  const session = {
    id: `sess-${Date.now()}`,
    userId: user.id,
    token,
    user: {
      id: user.id,
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId,
      schoolId: user.schoolId,
      mfaEnabled: user.mfaEnabled,
      mfaVerified: true,
    },
    deviceName: 'Navigateur Web',
    browser: req.headers['user-agent'] || 'Web',
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    revoked: false,
  };

  activeSessions.set(token, session);

  // Set HttpOnly Cookie
  res.cookie('eduka_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    token,
    user: session.user,
  });
});

// GET Current Authenticated User
authRouter.get('/me', authenticateSession, (req: Request, res: Response): void => {
  res.json({ user: req.user });
});

// Logout
authRouter.post('/logout', authenticateSession, (req: Request, res: Response): void => {
  if (req.sessionId) {
    for (const [token, session] of activeSessions.entries()) {
      if (session.id === req.sessionId) {
        activeSessions.delete(token);
        break;
      }
    }
  }

  res.clearCookie('eduka_session');
  res.json({ success: true, message: 'Déconnexion réussie.' });
});

// Forgot Password
authRouter.post('/forgot-password', (req: Request, res: Response): void => {
  // Always return generic response to prevent account enumeration
  res.json({
    success: true,
    message: 'Si cette adresse email existe dans notre système, un lien de réinitialisation sécurisé a été envoyé.',
  });
});
