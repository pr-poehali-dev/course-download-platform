import func2url from '../../backend/func2url.json';

const AUTH_API = func2url.auth;
const TOKEN_KEY = 'auth_token';

export interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  referral_code: string;
  role?: string;
  subscription_active?: boolean;
  subscription_end?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async register(username: string, email: string, password: string, securityQuestion: string, securityAnswer: string): Promise<AuthResponse> {
    const response = await fetch(`${AUTH_API}?action=register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, security_question: securityQuestion, security_answer: securityAnswer }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка регистрации');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${AUTH_API}?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка входа');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  async verify(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      return null;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 сек таймаут
      
      const response = await fetch(`${AUTH_API}?action=verify`, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && (data.error === 'Токен истёк' || data.error === 'Недействительный токен' || data.error === 'Пользователь не найден')) {
          this.logout();
        }
        return null;
      }

      return data.user;
    } catch (error) {
      return null;
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userId');
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('remember_me');
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  getUserId(): number | null {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  },
};