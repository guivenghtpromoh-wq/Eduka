import { Request, Response, NextFunction } from 'express';

export interface UserSession {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  schoolId: string;
  mfaEnabled: boolean;
  mfaVerified?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
      sessionId?: string;
    }
  }
}

// In-memory active sessions store backed by server logic
export interface ActiveServerSession {
  id: string;
  userId: string;
  token: string;
  user: UserSession;
  deviceName: string;
  browser: string;
  ipAddress: string;
  createdAt: Date;
  expiresAt: Date;
  revoked: boolean;
}

export const activeSessions = new Map<string, ActiveServerSession>();
export const userLockouts = new Map<string, { attempts: number; lockedUntil?: Date }>();

export function authenticateSession(req: Request, res: Response, next: NextFunction): void {
  // Extract token from Cookie or Authorization Header
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, val] = cookie.trim().split('=');
      acc[key] = val;
      return acc;
    }, {} as Record<string, string>);
    token = cookies['eduka_session'];
  }

  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentification requise.' } });
    return;
  }

  const session = activeSessions.get(token);
  if (!session || session.revoked || session.expiresAt < new Date()) {
    res.status(401).json({ error: { code: 'INVALID_SESSION', message: 'Session expirée ou invalide.' } });
    return;
  }

  req.user = session.user;
  req.sessionId = session.id;
  next();
}
