import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { register, login as loginApi } from '../services/authService';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  plan?: 'free' | 'pro';
  credits?: number;
  token?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
}

const STORAGE_KEY = 'tp-auth-user';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, lang, onClose, onAuthenticated }) => {
  const t = TRANSLATIONS[lang];
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setError(null);
  }, [mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!form.email || !form.password || (mode === 'signup' && !form.name)) {
      setError('Please fill all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const result = await loginApi({
          email: form.email,
          password: form.password,
        });

        if (!result.success || !result.user) {
          setError(result.message || 'Invalid credentials. Please try again.');
          setIsLoading(false);
          return;
        }

        const userToAuth: AuthUser = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          plan: result.user.plan || 'free',
          credits: result.user.credits || 0,
          token: result.token,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(userToAuth));
        onAuthenticated(userToAuth);
        onClose();
      } else {
        const result = await register({
          name: form.name,
          email: form.email,
          password: form.password,
        });

        if (!result.success || !result.user) {
          setError(result.message || 'Registration failed. Please try again.');
          setIsLoading(false);
          return;
        }

        const newUser: AuthUser = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          plan: result.user.plan || 'free',
          credits: result.user.credits || 0,
          token: result.token,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        onAuthenticated(newUser);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close authentication"
        >
          <X size={18} />
        </button>
        <div className="p-6">
          <p className="text-sm text-gray-500 font-medium mb-2">{t.authWelcome}</p>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {mode === 'login' ? t.authSignIn : t.authNoAccount}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded mb-3">
              {error}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t.authName}</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t.authEmail}</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t.authPassword}</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-2.5 rounded-md font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t.processing}
                </>
              ) : (
                mode === 'login' ? t.authSignIn : t.authNoAccount
              )}
            </button>
          </form>

          <div className="text-xs text-gray-600 mt-4 flex justify-between items-center">
            <span>{mode === 'login' ? t.authNoAccount : t.authHaveAccount}</span>
            <button
              className="text-emerald-600 font-semibold"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? t.authNoAccount : t.authSignIn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

