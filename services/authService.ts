
// Note: In Vite, environment variables must be prefixed with VITE_ to be accessible in client code
// Use VITE_API_BASE_URL in your .env.local file (e.g., VITE_API_BASE_URL=https://api.example.com)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Debug logging
if (import.meta.env.DEV) {
  console.log('Environment check:', {
    'import.meta.env.VITE_API_BASE_URL': import.meta.env.VITE_API_BASE_URL,
    'API_BASE_URL (resolved)': API_BASE_URL,
    'All VITE_ vars': Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  });
  
  if (!API_BASE_URL) {
    console.error('❌ VITE_API_BASE_URL is not set!');
    console.error('Please add VITE_API_BASE_URL=your_api_url to your .env.local file');
    console.error('Example: VITE_API_BASE_URL=https://api.example.com');
  } else {
    console.log('✅ API_BASE_URL loaded:', API_BASE_URL);
  }
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
  id: string;
  name: string;
  email: string;
    credits?: number;
    plan?: 'free' | 'pro';
  };
  token?: string;
  message?: string;
}

export interface BalanceResponse {
  success: boolean;
  credits?: number;
  message?: string;
}

export interface UpdateCreditRequest {
  userId: string;
  credit: number;
}

export interface UpdateCreditResponse {
  success: boolean;
  message?: string;
  balance?: number;
}

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const url = `${API_BASE_URL}/api/v1/auth/register`;
    if (import.meta.env.DEV) {
      console.log('Register URL:', url);
    }
    
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not configured. Please set VITE_API_BASE_URL in your .env.local file');
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(errorData.message || `Registration failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Registration result:', result);
    return {
      success: true,
      user: result.user || {
        id: result.id || `user_${Date.now()}`,
        name: result.name || data.name,
        email: result.email || data.email,
        credits: result.credits || 0,
        plan: result.plan || 'free',
      },
      token: result.token,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed. Please try again.',
    };
  }
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const url = `${API_BASE_URL}/api/v1/auth/login`;
    if (import.meta.env.DEV) {
      console.log('Login URL:', url);
    }
    
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not configured. Please set VITE_API_BASE_URL in your .env.local file');
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(errorData.message || `Login failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Login result:', result);
    return {
      success: true,
      user: result.user || {
        id: result.id || `user_${Date.now()}`,
        name: result.name || '',
        email: result.email || data.email,
        credits: result.credits || 0,
        plan: result.plan || 'free',
      },
      token: result.token,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Login failed. Please try again.',
    };
  }
};

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    const stored = localStorage.getItem('tp-auth-user');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.token || null;
    }
  } catch {
    // ignore
  }
  return null;
};

export const getBalance = async (): Promise<BalanceResponse> => {
  try {
    const url = `${API_BASE_URL}/api/v1/auth/myBalance`;
    if (import.meta.env.DEV) {
      console.log('Get Balance URL:', url);
    }
    
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not configured. Please set VITE_API_BASE_URL in your .env.local file');
    }

    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch balance' }));
      throw new Error(errorData.message || `Failed to fetch balance: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Get balance result:', result);
    
    // Handle response format: { "balance": 0 }
    if (result.balance !== undefined) {
      return {
        success: true,
        credits: result.balance,
      };
    } else if (result.credits !== undefined) {
      // Fallback for credits field
      return {
        success: true,
        credits: result.credits,
      };
    } else if (result.user?.credits !== undefined) {
      // Fallback for nested user.credits
      return {
        success: true,
        credits: result.user.credits,
      };
    } else {
      throw new Error('Invalid balance response format');
    }
  } catch (error) {
    console.error('Get balance error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch balance. Please try again.',
    };
  }
};

export interface UpdateCreditRequest {
  userId: string;
  credit: number;
}

export interface UpdateCreditResponse {
  success: boolean;
  message?: string;
  balance?: number;
  }

export const updateCredit = async (userId: string, remainingCredit: number): Promise<UpdateCreditResponse> => {
  try {
    // Validate inputs
    if (!userId || userId.trim() === '') {
      throw new Error('Missing required field: userId');
    }
    
    if (remainingCredit === undefined || remainingCredit === null || isNaN(remainingCredit)) {
      throw new Error('Missing required field: credit (remainingCredit)');
    }
    
    // Always use the API endpoint from env file
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not configured. Please set VITE_API_BASE_URL in your .env.local file');
    }
    
    // Always use direct URL from env file
    const url = `${API_BASE_URL}/api/v1/auth/updateCredit`;
    
    console.log('Update Credit URL:', url);
    console.log('Update Credit Request:', { userId, credit: remainingCredit, userIdType: typeof userId, creditType: typeof remainingCredit });
    
    const apiKey = import.meta.env.VITE_UPDATE_CREDIT_API_KEY || '';
    if (!apiKey) {
      console.warn('VITE_UPDATE_CREDIT_API_KEY is not set');
    }
    
    // Get auth token from localStorage
    const token = getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
};

    // Add authorization header if token exists (backend requires it)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Ensure userId is a valid string and credit is a valid number
    const userIdStr = String(userId || '').trim();
    const creditNum = Number(remainingCredit);
    
    if (!userIdStr) {
      throw new Error('userId is required and cannot be empty');
    }
    if (isNaN(creditNum) || creditNum < 0) {
      throw new Error('credit must be a valid number >= 0');
    }
    
    // Create request body matching backend format exactly
    const requestBody: UpdateCreditRequest = {
      userId: userIdStr,
      credit: creditNum,
    };
    
    const bodyString = JSON.stringify(requestBody);
    
    // Log detailed request information
    console.log('=== Update Credit Request ===');
    console.log('URL:', url);
    console.log('Method: POST');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body String:', bodyString);
    console.log('Body Parsed:', JSON.parse(bodyString));
    console.log('userId:', requestBody.userId, '(type:', typeof requestBody.userId + ')');
    console.log('credit:', requestBody.credit, '(type:', typeof requestBody.credit + ')');
    console.log('============================');
    
    let response: Response;
    try {
      // Ensure body is valid JSON string
      if (!bodyString || bodyString === '{}' || bodyString === 'null') {
        throw new Error('Invalid request body: body is empty or null');
      }
      
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: bodyString,
      });

      // Log response status for debugging
      console.log('Response status:', response.status, response.statusText);
    } catch (fetchError) {
      // Check if it's a CORS error
      if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
        throw new Error(
          'CORS error: The server at ' + API_BASE_URL + 
          ' needs to allow requests from this origin. ' +
          'Please configure the server to include "x-api-key" in Access-Control-Allow-Headers.'
        );
      }
      throw fetchError;
    }

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `Failed to update credit: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        if (import.meta.env.DEV) {
          console.error('Update credit error response:', errorData);
        }
      } catch {
        // If response is not JSON, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // Use default error message
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Update credit result:', result);
    
    return {
      success: true,
      message: result.message || 'Credit updated successfully',
      balance: result.balance || result.credits,
    };
  } catch (error) {
    console.error('Update credit error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update credit. Please try again.',
    };
  }
};
