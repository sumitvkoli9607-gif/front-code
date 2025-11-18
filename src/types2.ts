export interface SubscriptionPlan {
  name: 'Basic' | 'Pro' | 'Enterprise';
  price: number;
  features: string[];
  popular?: boolean;
}

export interface PayPalOrderResponse {
  orderID: string;
}

export interface PayPalCaptureResponse {
  status: string;
  capture: any; // Replace with specific PayPal capture response type if needed
}

export interface ApiError {
  error: string;
}