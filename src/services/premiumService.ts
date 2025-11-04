// src/services/premiumService.ts
import api from './api';

export interface PremiumStatus {
  success: boolean;
  is_premium: boolean;
  premium_expires_at: string | null;
  days_remaining: number | null;
}

export interface Payment {
  id: number;
  payment_reference: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  screenshot_path: string;
  created_at: string;
  admin_notes?: string;
}

export interface PaymentSubmission {
  payment_reference: string;
  amount?: number;
  mobile_number: string;
  screenshot?: File;
}

export interface PricingData {
  currency: string;
  currency_symbol: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  duration_days: number;
  description: string;
  formatted: {
    original_price: string;
    discounted_price: string;
  };
}

const PremiumService = {
  /**
   * Get current pricing information
   */
  async getPricing(): Promise<{ success: boolean; data: PricingData }> {
    const response = await api.get('/pricing');
    return response.data;
  },

  /**
   * Get user's premium status
   */
  async getPremiumStatus(): Promise<PremiumStatus> {
    const response = await api.get('/premium/status');
    return response.data;
  },

  /**
   * Submit payment for approval
   */
  async submitPayment(data: PaymentSubmission) {
    const formData = new FormData();
    formData.append('payment_reference', data.payment_reference);
    if (data.amount) {
      formData.append('amount', data.amount.toString());
    }
    formData.append('mobile_number', data.mobile_number);
    if (data.screenshot) {
      formData.append('screenshot', data.screenshot);
    }

    const response = await api.post('/payments/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get user's payment history
   */
  async getPaymentHistory(): Promise<{ success: boolean; payments: Payment[] }> {
    const response = await api.get('/payments/history');
    return response.data;
  },

  /**
   * Check if user has pending payment
   */
  async getPendingPayment(): Promise<{
    success: boolean;
    has_pending: boolean;
    pending_payment: Payment | null;
  }> {
    const response = await api.get('/payments/pending');
    return response.data;
  },
};

export default PremiumService;
