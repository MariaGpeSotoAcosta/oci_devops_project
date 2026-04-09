import { createBrowserRouter } from 'react-router';
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import Root from './pages/Root';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/forgot-password',
    Component: ForgotPassword,
  },
  {
    path: '/dashboard',
    Component: Root,
  },
  {
    path: '/board',
    Component: Root,
  },
  {
    path: '/backlog',
    Component: Root,
  },
  {
    path: '/projects',
    Component: Root,
  },
  {
    path: '/projects/:id',
    Component: Root,
  },
  {
    path: '/teams',
    Component: Root,
  },
  {
    path: '/calendar',
    Component: Root,
  },
  {
    path: '/settings',
    Component: Root,
  },
  {
    path: '/chatbot',
    Component: Root,
  },
]);