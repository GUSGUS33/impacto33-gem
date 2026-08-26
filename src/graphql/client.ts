import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const WP_GRAPHQL_URL = typeof window === "undefined"
  ? process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || process.env.VITE_WP_GRAPHQL_URL || "https://creativu.es/graphql"
  : "/api/graphql";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: WP_GRAPHQL_URL,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
      errorPolicy: "ignore",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
});
