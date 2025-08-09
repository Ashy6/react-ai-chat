import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/apollo-client';
import { Demo } from './pages/Demo';
import GraphQLTest from './pages/GraphQLTest';

function App() {
  // 简单的路由逻辑，通过 URL hash 来切换页面
  const currentPath = window.location.hash.slice(1) || 'demo';
  
  const renderPage = () => {
    switch (currentPath) {
      case 'test':
        return <GraphQLTest />;
      case 'demo':
      default:
        return <Demo />;
    }
  };
  
  return (
    <ApolloProvider client={apolloClient}>
      <div>
        {/* 简单的导航 */}
        <nav className="bg-gray-800 text-white p-4">
          <div className="max-w-4xl mx-auto flex space-x-4">
            <a 
              href="#demo" 
              className={`px-3 py-2 rounded-md ${
                currentPath === 'demo' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              聊天演示
            </a>
            <a 
              href="#test" 
              className={`px-3 py-2 rounded-md ${
                currentPath === 'test' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              GraphQL 测试
            </a>
          </div>
        </nav>
        
        {renderPage()}
      </div>
    </ApolloProvider>
  );
}

export default App;
