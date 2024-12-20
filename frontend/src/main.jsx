import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Provider } from 'react-redux';
import store from './store/store.js';
import AuthenticateHandler from './components/AuthenticateHandler.jsx';
import { ToastContainer } from 'react-toastify';
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthenticateHandler>
        <Auth0Provider
          domain="dev-8qz3qdgxm6bu5ywm.us.auth0.com"
          clientId="BsRDzio0JtR6BmfYutkIJcTLdUcUwRNV"
          authorizationParams={{
            redirect_uri: "http://localhost:3000/oauth-callback",
          }}
        >
          <App />
        </Auth0Provider>
        <ToastContainer theme='dark' />
      </AuthenticateHandler>
    </Provider>
  </StrictMode>,
)
