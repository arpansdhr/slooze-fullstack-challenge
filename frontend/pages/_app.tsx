import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { ApolloProvider } from '@apollo/client/react';
import { useApollo } from '../src/apolloClient';

export default function App({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo();

  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
