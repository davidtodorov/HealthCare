import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

interface SubscriptionRequest {
  userId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly swPush = inject<SwPush | null>(SwPush, { optional: true });
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    if (this.swPush) {
      this.swPush.notificationClicks.subscribe(event => {
        const targetUrl: string | undefined = (event.notification?.data as any)?.url;
        if (targetUrl) {
          this.router.navigateByUrl(targetUrl);
        }
      });
    }
  }

  get isSupported(): boolean {
    return !!this.swPush?.isEnabled;
  }

  getSubscriptionState() {
    if (!this.swPush) {
      return of(false);
    }
    return this.swPush.subscription.pipe(map(subscription => !!subscription));
  }

  async subscribe(): Promise<boolean> {
    if (!this.swPush) {
      return false;
    }

    if (typeof Notification === 'undefined') {
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    const userId = this.authService.getUserId();
    if (userId == null) {
      throw new Error('User must be logged in to enable reminders.');
    }

    const existing = await firstValueFrom(this.swPush.subscription);
    if (existing) {
      await this.sendSubscriptionToServer(existing, userId);
      return true;
    }

    const serverPublicKey = await this.fetchPublicKey();
    const subscription = await this.swPush.requestSubscription({
      serverPublicKey
    });

    await this.sendSubscriptionToServer(subscription, userId);
    return true;
  }

  async unsubscribe(): Promise<void> {
    if (!this.swPush) {
      return;
    }

    const subscription = await firstValueFrom(this.swPush.subscription);
    if (!subscription) {
      return;
    }

    await firstValueFrom(this.http.post('api/PushNotifications/unsubscribe', this.mapSubscription(subscription)));
    await subscription.unsubscribe();
  }

  private async fetchPublicKey(): Promise<string> {
    const fromEnvironment = environment.vapidPublicKey;
    if (fromEnvironment) {
      return fromEnvironment;
    }

    const response = await firstValueFrom(this.http.get<{ publicKey: string }>('api/PushNotifications/public-key'));
    return response.publicKey;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription, userId: number): Promise<void> {
    const payload: SubscriptionRequest = { ...this.mapSubscription(subscription), userId };
    await firstValueFrom(this.http.post('api/PushNotifications/subscribe', payload));
  }

  private mapSubscription(subscription: PushSubscription): Omit<SubscriptionRequest, 'userId'> {
    const json = subscription.toJSON();
    return {
      endpoint: subscription.endpoint,
      p256dh: json.keys?.['p256dh'] ?? '',
      auth: json.keys?.['auth'] ?? ''
    };
  }
}
