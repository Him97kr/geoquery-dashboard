// src/apollo/client.js
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Country: {
        keyFields: ["code"],
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-first" },
    query: { fetchPolicy: "cache-first" },
  },
});
