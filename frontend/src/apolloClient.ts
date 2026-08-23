import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window === 'undefined'
    ? 'http://localhost:4000/graphql'
    : `http://${window.location.hostname}:4000/graphql`);

const httpLink = createHttpLink({
  uri: apiUrl,
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  const token = Cookies.get('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export function useApollo() {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}
