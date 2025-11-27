import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

interface RateLimitOptions {
  limit: number;
  windowMinutes: number;
  keyPrefix?: string;
}

/**
 * Verifica rate limit usando a função do banco de dados
 * @param supabaseUrl - URL do Supabase
 * @param supabaseKey - Chave do Supabase (service role)
 * @param identifier - Identificador único (IP, user ID, etc)
 * @param options - Configurações de rate limit
 * @returns Objeto com allowed (boolean) e remaining (number)
 */
export async function checkRateLimit(
  supabaseUrl: string,
  supabaseKey: string,
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { limit, windowMinutes, keyPrefix = "rl" } = options;
  const key = `${keyPrefix}:${identifier}`;

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_minutes: windowMinutes,
    });

    if (error) {
      console.error("Rate limit check error:", error);
      // Em caso de erro, permitir a requisição (fail open)
      return { allowed: true, remaining: limit };
    }

    return data[0] || { allowed: true, remaining: limit };
  } catch (err) {
    console.error("Rate limit exception:", err);
    // Em caso de erro, permitir a requisição (fail open)
    return { allowed: true, remaining: limit };
  }
}

/**
 * Extrai identificador da requisição (IP ou outro header)
 */
export function getRequestIdentifier(req: Request): string {
  // Tentar pegar IP de headers comuns
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback para user agent (menos ideal)
  return req.headers.get("user-agent") || "unknown";
}

/**
 * Cria resposta de rate limit excedido
 */
export function rateLimitExceededResponse(remaining: number = 0): Response {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      message: "Muitas requisições. Tente novamente em alguns minutos.",
      remaining,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": remaining.toString(),
        "Retry-After": "60",
      },
    }
  );
}
