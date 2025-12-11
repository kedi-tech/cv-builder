
// Use proxy in development to avoid CORS issues, direct URL in production
const PAYMENT_WEBHOOK_URL = import.meta.env.VITE_PAYMENT_WEBHOOK_URL || 'https://n8n.kedi-tech.com/webhook/ab839d73-7e7f-415e-ba8d-b40613a48551';
const PAYMENT_API_KEY = import.meta.env.VITE_PAYMENT_API_KEY || '';
export interface PaymentRequest {
  user_id: string;
  amount: number; // Amount in GNF
  credits: number; // Number of credits being purchased
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  order_id?: string;
  payment_url?: string;
}

export const processPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Only add Authorization header if API key is provided
    if (PAYMENT_API_KEY) {
      headers['Authorization'] = `Bearer ${PAYMENT_API_KEY}`;
    }

    const response = await fetch(PAYMENT_WEBHOOK_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    // Get response text first to check if it's empty
    const responseText = await response.text();
    
    if (!response.ok) {
      // Try to parse error message if available
      let errorMessage = `Payment failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If not JSON, use the text or status text
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Check if response is empty
    if (!responseText || responseText.trim().length === 0) {
      throw new Error('Empty response from payment server');
    }

    // Parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', responseText);
      throw new Error(`Invalid JSON response from payment server: ${responseText.substring(0, 100)}`);
    }
    
    console.log('Payment response:', data);
    // Handle the response format: { order_id, result: { status, payment_url } }
    if (data.result && data.result.payment_url) {
      // Check if status is "ENABLED" or numeric 200 (for backward compatibility)
      const isValidStatus = data.result.status === 'ENABLED' || data.result.status === 200;
      
      if (isValidStatus) {
        return {
          success: true,
          message: 'Payment URL generated successfully',
          order_id: data.order_id,
          payment_url: data.result.payment_url,
        };
      } else {
        throw new Error(`Payment order not enabled. Status: ${data.result.status}`);
      }
    }

    // Fallback for old format (direct payment_url)
    if (data.payment_url) {
      return {
        success: true,
        message: 'Payment processed successfully',
        order_id: data.order_id || data.transaction_id || `CP-${Date.now()}`,
        payment_url: data.payment_url,
      };
    }

    // If no payment_url found, return error
    throw new Error('Payment URL not found in response');
  } catch (error) {
    console.error('Payment error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Payment processing failed',
    };
  }
};
