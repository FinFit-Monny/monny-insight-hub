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
            backgroundColor: '#7F22FE',
            '&:hover': { backgroundColor: '#4D179A' },
            '&:focus': { backgroundColor: '#4D179A' },
          },
          footerActionLink: {
            color: '#7F22FE',
            '&:hover': { color: '#4D179A' },
          },
          identityPreviewEditButton: { color: '#7F22FE' },
          spinner: { color: '#7F22FE' },
          formFieldInput: {
            '&:focus': {
              borderColor: '#7F22FE',
              boxShadow: '0 0 0 1px #7F22FE',
            },
          },
          socialButtonsBlockButton: {
            '&:hover': { backgroundColor: '#F4EDFF' },
          },
        },
        variables: {
          colorPrimary: '#7F22FE',
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


