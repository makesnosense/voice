import { db } from '../db';
import { otpCodes, refreshTokens } from '../db/schema';
import { lt, sql } from 'drizzle-orm';

export default class AuthCleanupManager {
  private intervalId: NodeJS.Timeout | null = null;
  private checkIntervalMs = 60 * 60 * 1000; // 1 hour

  start(): void {
    this.intervalId = setInterval(() => {
      this.performCleanup();
    }, this.checkIntervalMs);

    console.log('🧹 Auth cleanup manager started');
  }

  private async performCleanup(): Promise<void> {
    try {
      await this.cleanExpiredOtps();
    } catch (error) {
      console.error('❌ Failed to clean expired OTPs:', error);
    }

    try {
      await this.cleanOldRefreshTokens();
    } catch (error) {
      console.error('❌ Failed to clean old refresh tokens:', error);
    }
  }

  private async cleanExpiredOtps(): Promise<void> {
    const deletedOtps = await db
      .delete(otpCodes)
      .where(lt(otpCodes.expiresAt, new Date()))
      .returning({ id: otpCodes.id });

    if (deletedOtps.length > 0) {
      console.log(`🧹 Cleaned ${deletedOtps.length} expired OTP codes`);
    }
  }

  private async cleanOldRefreshTokens(): Promise<void> {
    const deletedJtis = await db.execute(sql`
    WITH users_with_excess AS (
      SELECT user_id
      FROM refresh_tokens
      GROUP BY user_id
      HAVING COUNT(*) > 10
    ),
    ranked_tokens AS (
      SELECT jti,
             ROW_NUMBER() OVER (
               PARTITION BY user_id 
               ORDER BY created_at DESC
             ) as row_num
      FROM refresh_tokens
      WHERE user_id IN (SELECT user_id FROM users_with_excess)
    )
    DELETE FROM refresh_tokens
    WHERE jti IN (
      SELECT jti FROM ranked_tokens WHERE row_num > 10
    )
    RETURNING jti
  `);

    if (deletedJtis.length > 0) {
      console.log(`🧹 Cleaned ${deletedJtis.length} old refresh tokens`);
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('⏹️ Auth cleanup stopped');
    }
  }
}
