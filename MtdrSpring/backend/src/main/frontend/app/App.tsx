import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TeamProvider } from './context/TeamContext';
import { ErrorProvider } from './context/ErrorContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TeamProvider>
          <ErrorProvider>
            <RouterProvider router={router} />
          </ErrorProvider>
        </TeamProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
