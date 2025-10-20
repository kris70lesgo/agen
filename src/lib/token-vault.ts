import { auth0 } from "./auth0";

/**
 * Token Vault - Secure API Token Management
 * Stores and manages third-party API tokens on behalf of users
 */

export interface TokenConfig {
  userId: string;
  provider: 'gemini' | 'openrouter' | 'spoonacular' | 'brevo' | 'pdfbolt';
  token: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface StoredToken {
  id: string;
  provider: string;
  maskedToken: string;
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
}

/**
 * Token Vault Service
 * In production, this would use Auth0's Token Vault or a secure key management service
 */
export class TokenVault {
  /**
   * Store a token securely
   * In production, this would encrypt and store in Auth0 Token Vault
   */
  static async storeToken(config: TokenConfig): Promise<void> {
    try {
      // Validate user session
      const session = await auth0.getSession();
      if (!session?.user || session.user.sub !== config.userId) {
        throw new Error('Unauthorized');
      }

      // In production, this would:
      // 1. Encrypt the token
      // 2. Store in Auth0 User Metadata or Token Vault
      // 3. Use Auth0 Management API
      
      console.log(`[TokenVault] Storing token for ${config.provider} (user: ${config.userId})`);
      
      // For now, we'll use environment variables (development only)
      // TODO: Implement actual secure storage with Auth0 Management API
      
    } catch (error) {
      console.error('[TokenVault] Error storing token:', error);
      throw new Error('Failed to store token');
    }
  }

  /**
   * Retrieve a token from the vault
   * Returns the decrypted token if user has permission
   */
  static async getToken(
    userId: string,
    provider: string
  ): Promise<string | null> {
    try {
      // Validate user session
      const session = await auth0.getSession();
      if (!session?.user || session.user.sub !== userId) {
        throw new Error('Unauthorized');
      }

      // In production, this would:
      // 1. Fetch encrypted token from Auth0
      // 2. Decrypt using secure key
      // 3. Return to authorized user only

      // For development, use environment variables
      const tokenMap: Record<string, string | undefined> = {
        gemini: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY,
        spoonacular: process.env.SPOONACULAR_API_KEY,
        brevo: process.env.BREVO_API_KEY,
        pdfbolt: process.env.PDFBOLT_API_KEY,
      };

      const token = tokenMap[provider];
      
      if (token) {
        console.log(`[TokenVault] Retrieved token for ${provider} (user: ${userId})`);
      }
      
      return token || null;
    } catch (error) {
      console.error('[TokenVault] Error retrieving token:', error);
      return null;
    }
  }

  /**
   * List all tokens for a user (masked)
   */
  static async listTokens(userId: string): Promise<StoredToken[]> {
    try {
      // Validate user session
      const session = await auth0.getSession();
      if (!session?.user || session.user.sub !== userId) {
        throw new Error('Unauthorized');
      }

      // In production, fetch from Auth0 User Metadata
      // For now, return mock data
      const providers = ['gemini', 'openrouter', 'spoonacular', 'brevo', 'pdfbolt'];
      
      return providers.map(provider => ({
        id: `${userId}-${provider}`,
        provider,
        maskedToken: '••••••••••••••••',
        createdAt: new Date(),
      }));
    } catch (error) {
      console.error('[TokenVault] Error listing tokens:', error);
      return [];
    }
  }

  /**
   * Rotate a token
   */
  static async rotateToken(
    userId: string,
    provider: TokenConfig['provider'],
    newToken: string
  ): Promise<void> {
    try {
      // Store the new token
      await this.storeToken({ userId, provider, token: newToken });
      
      console.log(`[TokenVault] Token rotated for ${provider} (user: ${userId})`);
    } catch (error) {
      console.error('[TokenVault] Error rotating token:', error);
      throw new Error('Failed to rotate token');
    }
  }

  /**
   * Revoke a token
   */
  static async revokeToken(userId: string, provider: string): Promise<void> {
    try {
      // Validate user session
      const session = await auth0.getSession();
      if (!session?.user || session.user.sub !== userId) {
        throw new Error('Unauthorized');
      }

      // In production, delete from Auth0 Token Vault
      console.log(`[TokenVault] Token revoked for ${provider} (user: ${userId})`);
    } catch (error) {
      console.error('[TokenVault] Error revoking token:', error);
      throw new Error('Failed to revoke token');
    }
  }

  /**
   * Update token last used timestamp
   */
  static async trackTokenUsage(userId: string, provider: string): Promise<void> {
    try {
      // In production, update metadata in Auth0
      console.log(`[TokenVault] Token usage tracked for ${provider} (user: ${userId})`);
    } catch (error) {
      console.error('[TokenVault] Error tracking token usage:', error);
    }
  }

  /**
   * Mask a token for display (show only last 4 characters)
   */
  static maskToken(token: string): string {
    if (token.length <= 4) return '••••';
    return '•'.repeat(token.length - 4) + token.slice(-4);
  }
}
