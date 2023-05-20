// apolloClient.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';

export const apolloClient = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // Reemplaza esto con la URI de tu servidor GraphQL
  cache: new InMemoryCache(),
});
