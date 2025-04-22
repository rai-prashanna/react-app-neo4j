import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './flags.css';
import './App.css';
import reportWebVitals from './reportWebVitals';
import UnServiceDevice from './component/UnServiceDevice';
import Main from './component/Main';
import AppBar from './component/AppBar';
import Parent from './component/Parent';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  makeVar,
} from "@apollo/client";

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
// Core PrimeReact styles
import 'primereact/resources/primereact.min.css';

// Choose ONE theme
import 'primereact/resources/themes/saga-blue/theme.css';  // Saga Blue Theme

const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <ApolloProvider client={client}>
      <Main/>
    </ApolloProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
