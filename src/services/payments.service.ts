import type { CurrencyCode, PaymentMethodInfo, PaymentOption, Money } from '@/types';
import { getCoupon } from '@/lib/store';

/**
 * Payment abstraction.
 *
 * The checkout never talks to a specific gateway. Providers implement the
 * PaymentProvider contract; adding a new gateway (M-Pesa, Tigo Pesa, cards,
 * PayPal, Stripe...) means registering one more provider, not rebuilding the
 * checkout.
 */

export interface PaymentProvider {
  id: string;
  name: string;
  methods: PaymentMethodInfo[];
  currencies: CurrencyCode[];
  initiate(input: {
    amount: Money;
    userId: string;
    method: string;
    description: string;
  }): Promise<{ reference: string; requiresVerification: boolean; message?: string }>;
  verify(reference: string): Promise<{ confirmed: boolean; meta?: Record<string, unknown> }>;
}

function simulateModalDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Demo provider: simulates a mobile-money / card gateway. */
const demoProvider: PaymentProvider = {
  id: 'sns-demo-gateway',
  name: 'SNS Demo Gateway',
  methods: [
    { id: 'm-pesa', label: 'M-Pesa', detail: 'Tanzania mobile money' },
    { id: 'tigo-pesa', label: 'Tigo Pesa', detail: 'Tanzania mobile money' },
    { id: 'airtel-money', label: 'Airtel Money', detail: 'Mobile money' },
    { id: 'card', label: 'Card', detail: 'Visa · Mastercard' },
    { id: 'paypal', label: 'PayPal', detail: 'International' },
  ],
  currencies: ['TZS', 'USD', 'EUR', 'GBP'],
  async initiate(input) {
    await simulateModalDelay(700);
    return {
      reference: `PAY-${Date.now().toString(36).toUpperCase()}`,
      requiresVerification: true,
      message: `Payment prompt sent to ${input.method.replace(/-/g, ' ')}. Approve to continue.`,
    };
  },
  async verify() {
    await simulateModalDelay(900);
    return { confirmed: true, meta: { provider: 'demo', sandbox: true } };
  },
};

const providers: PaymentProvider[] = [demoProvider];

export function paymentOptionsFor(currency: CurrencyCode): PaymentOption[] {
  return providers
    .filter((p) => p.currencies.includes(currency))
    .map((p) => ({
      providerId: p.id,
      providerName: p.name,
      methods: p.methods,
      currencies: p.currencies,
    }));
}

export function getProvider(id: string): PaymentProvider | undefined {
  return providers.find((p) => p.id === id);
}

export { getCoupon, simulateModalDelay as paymentDelay };