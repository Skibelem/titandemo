import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    // Load Paystack script
    if (!document.getElementById('paystack-script')) {
      const script = document.createElement('script');
      script.id = 'paystack-script';
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.async = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }

    // Fetch public key from edge function
    supabase.functions.invoke('get-paystack-key').then(({ data, error }) => {
      if (!error && data?.publicKey) {
        setPublicKey(data.publicKey);
      } else {
        console.error('Failed to fetch Paystack key:', error);
      }
    });
  }, []);

  const pay = useCallback(
    ({
      email,
      amount,
      onSuccess,
      onClose,
    }: {
      email: string;
      amount: number;
      onSuccess: (reference: string) => void;
      onClose: () => void;
    }) => {
      if (!window.PaystackPop) {
        console.error('Paystack not loaded');
        return;
      }
      if (!publicKey) {
        console.error('Paystack public key not available');
        return;
      }

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount,
        currency: 'NGN',
        callback: (response) => onSuccess(response.reference),
        onClose,
      });

      handler.openIframe();
    },
    [publicKey]
  );

  return { pay, isLoaded: isLoaded && !!publicKey };
}
