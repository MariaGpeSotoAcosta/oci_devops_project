import { createContext, useContext, useState, useCallback } from 'react';
import { ErrorToast } from '../components/ErrorToast';

interface ErrorContextType {
  showError: (message: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<{ id: number; message: string }[]>([]);
  const nextId = { current: 0 };

  const showError = useCallback((message: string) => {
    const id = ++nextId.current;
    setErrors((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setErrors((prev) => prev.filter((e) => e.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {errors.map((e) => (
          <ErrorToast key={e.id} message={e.message} onDismiss={() => dismiss(e.id)} />
        ))}
      </div>
    </ErrorContext.Provider>
  );
}

export function useError(): ErrorContextType {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('useError must be used within ErrorProvider');
  return ctx;
}
