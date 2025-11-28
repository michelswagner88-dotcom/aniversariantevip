import * as Sentry from "@sentry/react";

export const useSentry = () => {
  const captureError = (error: any, context?: Record<string, any>) => {
    Sentry.captureException(error, {
      extra: context,
    });
  };

  const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    Sentry.captureMessage(message, level);
  };

  const setUserContext = (user: { id: string; email?: string } | null) => {
    Sentry.setUser(user);
  };

  return { captureError, captureMessage, setUserContext };
};
