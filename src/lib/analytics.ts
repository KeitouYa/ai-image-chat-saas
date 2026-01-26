import { logger } from "./logger";

/**
 * Analytics Tracking
 * Simple analytics system (can be extended to use external services)
 */

interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  requestId?: string;
  timestamp?: Date;
}

class Analytics {
  private events: AnalyticsEvent[] = [];

  /**
   * Track an event
   */
  track(event: AnalyticsEvent): void {
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(enrichedEvent);

    // In production, send to analytics service (e.g., PostHog, Mixpanel)
    logger.debug("Analytics event tracked", enrichedEvent);

    // Keep only last 100 events in memory (for testing)
    if (this.events.length > 100) {
      this.events.shift();
    }
  }

  /**
   * Track AI usage
   */
  trackAIUsage(
    provider: string,
    operation: "chat" | "image",
    duration: number,
    creditsUsed: number,
    userId?: string,
    requestId?: string
  ): void {
    this.track({
      event: "ai_usage",
      userId,
      requestId,
      properties: {
        provider,
        operation,
        duration,
        creditsUsed,
      },
    });
  }

  /**
   * Track credit purchase
   */
  trackCreditPurchase(
    amount: number,
    credits: number,
    userId?: string,
    requestId?: string
  ): void {
    this.track({
      event: "credit_purchase",
      userId,
      requestId,
      properties: {
        amount,
        credits,
      },
    });
  }

  /**
   * Get events (for admin dashboard)
   */
  getEvents(limit = 50): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }
}

export const analytics = new Analytics();


