import React, { useState, useMemo } from 'react';
import { Gift, ShieldCheck, X, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { processPayment, PaymentRequest } from '../services/paymentService';
import { AuthUser } from './AuthModal';

export interface CheckoutResult {
  credits: number;
  amount: number;
  reference: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  lang: Language;
  user: AuthUser | null;
  onClose: () => void;
  onComplete: (result: CheckoutResult) => void;
}

// Credit packages: 10 credits = 10,000 GNF
const CREDIT_PACKAGES = [
  { credits: 10, price: 10000, label: '10 Credits' },
  { credits: 25, price: 25000, label: '25 Credits' },
  { credits: 50, price: 50000, label: '50 Credits' },
  { credits: 100, price: 100000, label: '100 Credits' },
];

// Calculate bonus: 20% bonus for purchases > 10 credits
const calculateBonus = (credits: number): number => {
  if (credits > 10) {
    return Math.floor(credits * 0.2); // 20% bonus
  }
  return 0;
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, lang, user, onClose, onComplete }) => {
  const t = TRANSLATIONS[lang];
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate bonus and total credits
  const bonusCredits = useMemo(() => calculateBonus(selectedPackage.credits), [selectedPackage.credits]);
  const totalCredits = selectedPackage.credits + bonusCredits;

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!user) {
      setError('Please sign in first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const paymentRequest: PaymentRequest = {
        user_id: user.id,
        amount: selectedPackage.price,
        credits: totalCredits, // Include bonus credits in the total
      };

      const paymentResult = await processPayment(paymentRequest);

      if (!paymentResult.success || !paymentResult.payment_url) {
        setError(paymentResult.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Store order information for verification after payment
      const orderData = {
        order_id: paymentResult.order_id,
        user_id: user.id,
        credits: totalCredits,
        amount: selectedPackage.price,
        timestamp: Date.now(),
      };
      localStorage.setItem(`tp-order-${paymentResult.order_id}`, JSON.stringify(orderData));

      // Redirect to payment URL
      window.location.href = paymentResult.payment_url;
    } catch (err) {
      setError('Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10" onClick={onClose} aria-label="Close checkout">
          <X size={18} />
        </button>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold mb-2">
            <ShieldCheck size={16} /> {t.checkoutTitle}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.buyCredits}</h2>
          <p className="text-sm text-gray-600 mb-4">{t.checkoutDescription}</p>

          {user && (
            <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-800 font-semibold">
                {t.currentCredits}: <span className="text-lg">{user.credits || 0}</span>
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-6">
            {CREDIT_PACKAGES.map((pkg) => {
              const pkgBonus = calculateBonus(pkg.credits);
              const pkgTotal = pkg.credits + pkgBonus;
              const isSelected = selectedPackage.credits === pkg.credits;
              
              return (
                <label 
                  key={pkg.credits}
                  className={`block border rounded-lg p-4 cursor-pointer transition ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="package"
                        checked={isSelected}
                        onChange={() => setSelectedPackage(pkg)}
                        className="mr-2"
                      />
                      <div>
                        <span className="font-semibold text-gray-900">{pkg.label}</span>
                        {pkgBonus > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1 inline-flex">
                            <Gift size={12} />
                            +{pkgBonus} {t.bonus}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-emerald-700 font-bold">
                      {pkg.price.toLocaleString()} GNF
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 ml-6">
                    {pkgTotal} {t.totalCredits} ({pkg.credits} {t.base} {pkgBonus > 0 && `+ ${pkgBonus} ${t.bonus}`})
                  </div>
                </label>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">{t.selectedPackage}:</span>
              <span className="text-sm font-bold text-gray-900">{selectedPackage.label}</span>
            </div>
            {bonusCredits > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-emerald-700 flex items-center gap-1">
                  <Gift size={14} /> {t.bonusCredits}:
                </span>
                <span className="text-sm font-bold text-emerald-700">+{bonusCredits}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-300">
              <span className="text-base font-bold text-gray-900">{t.totalCredits}:</span>
              <span className="text-lg font-bold text-emerald-700">{totalCredits}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">{t.totalAmount}:</span>
              <span className="text-base font-bold text-gray-900">{selectedPackage.price.toLocaleString()} GNF</span>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t.processing}
              </>
            ) : (
              t.completePurchase
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;

