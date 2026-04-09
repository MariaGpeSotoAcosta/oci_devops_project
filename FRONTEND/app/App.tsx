import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TeamProvider } from './context/TeamContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TeamProvider>
          <RouterProvider router={router} />
        </TeamProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
