import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

interface ClerkProviderProps {
  children: ReactNode;
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  // Keep failure explicit in development; mirrors monny-academy pattern
  throw new Error('Missing Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env file');
}

export const ClerkProvider = ({ children }: ClerkProviderProps) => {
  return (
    <BaseClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        elements: {
          formButtonPrimary: {
            backgroundColor: '#0B6CF3',
            '&:hover': { backgroundColor: '#0A52BF' },
            '&:focus': { backgroundColor: '#0A52BF' },
          },
          footerActionLink: {
            color: '#0B6CF3',
            '&:hover': { color: '#0A52BF' },
          },
          identityPreviewEditButton: { color: '#0B6CF3' },
          spinner: { color: '#0B6CF3' },
          formFieldInput: {
            '&:focus': {
              borderColor: '#0B6CF3',
              boxShadow: '0 0 0 1px #0B6CF3',
            },
          },
          socialButtonsBlockButton: {
            '&:hover': { backgroundColor: '#E6F0FF' },
          },
        },
        variables: {
          colorPrimary: '#0B6CF3',
          colorSuccess: '#1DBF73',
          colorWarning: '#FFD62E',
          colorDanger: '#ef4444',
          fontFamily: 'inherit',
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  );
};


