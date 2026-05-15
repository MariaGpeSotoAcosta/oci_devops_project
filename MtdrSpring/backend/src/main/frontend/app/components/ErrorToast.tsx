import { AlertTriangle, X } from 'lucide-react';

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

/**
 * Single error toast rendered in the bottom-right corner.
 * Stacked and managed by ErrorProvider in ErrorContext.
 */
export function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  return (
    <div
      role="alert"
      className="
        pointer-events-auto flex items-start gap-3
        bg-white dark:bg-gray-900
        border border-red-200 dark:border-red-800
        text-red-700 dark:text-red-400
        shadow-lg rounded-lg px-4 py-3
        animate-in slide-in-from-right-4 fade-in duration-200
      "
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
      <p className="flex-1 text-sm leading-snug">{message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
