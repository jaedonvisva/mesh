'use client';

import { Poppins } from 'next/font/google'
import { useState, useEffect } from 'react';

import './globals.css'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] })

import { Auth0Provider } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [redirectUri, setRedirectUri] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectUri(window.location.origin);
    }
  }, []);

  
  const onRedirectCallback = (appState: any) => {
    router.push(appState?.returnTo || '/');
  };

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}

    >
      <html lang="en">
        <body className={poppins.className}>{children}</body>
      </html>
    </Auth0Provider>
  );
}

