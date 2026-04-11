import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

export function usePaystack() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (document.getElementById('paystack-script')) {
      setIsLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);
  }, []);

  const pay = useCallback(
    ({
      email,
      amount,
      onSuccess,
      onClose,
    }: {
      email: string;
      amount: number; // in kobo/cents
      onSuccess: (reference: string) => void;
      onClose: () => void;
    }) => {
      if (!window.PaystackPop) {
        console.error('Paystack not loaded');
        return;
      }

      const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!publicKey) {
        console.error('Paystack public key not configured');
        return;
      }

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount,
        currency: 'NGN',
        callback: (response) => {
          onSuccess(response.reference);
        },
        onClose,
      });

      handler.openIframe();
    },
    []
  );

  return { pay, isLoaded };
}
