import * as Sentry from "@sentry/react";

export const handleSupabaseError = (error: any, context?: string) => {
  console.error(`Erro ${context}:`, error);
  
  Sentry.captureException(error, {
    tags: {
      type: 'supabase_error',
      context: context || 'unknown',
    },
    extra: {
      message: error.message,
      code: error.code,
      details: error.details,
    },
  });
};

export const handleEdgeFunctionError = (error: any, functionName: string, body?: any) => {
  console.error(`Erro edge function ${functionName}:`, error);
  
  Sentry.captureException(error, {
    tags: { 
      type: 'edge_function', 
      function: functionName 
    },
    extra: { 
      body,
      message: error.message,
    },
  });
};
