import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/apollo-client';
import { Demo } from './pages/Demo';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Demo />
    </ApolloProvider>
  );
}

export default App;
