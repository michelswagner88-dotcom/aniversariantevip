import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSecurityMetrics } from "@/hooks/useSecurityMetrics";
import { AlertTriangle, ShieldAlert, UserX, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const SecurityDashboard = () => {
  const { data: metrics, isLoading } = useSecurityMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!metrics) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de Segurança</h2>
        <p className="text-muted-foreground">
          Monitoramento em tempo real de métricas e alertas de segurança
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login Falhos (24h)</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics.failedLogins24h}
            </div>
            <p className="text-xs text-muted-foreground">
              Tentativas de acesso não autorizado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cadastros Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.pendingRegistrations}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuários com cadastro incompleto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limits (Hoje)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.rateLimitsHit}
            </div>
            <p className="text-xs text-muted-foreground">
              Limites de taxa atingidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics.suspiciousActivities.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Atividades suspeitas detectadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Eventos (Últimos 7 Dias)</CardTitle>
          <CardDescription>
            Visualização temporal de eventos de segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.securityTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })}
              />
              <Line 
                type="monotone" 
                dataKey="events" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Eventos"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top IPs Bloqueados */}
        <Card>
          <CardHeader>
            <CardTitle>Top IPs com Falhas de Login</CardTitle>
            <CardDescription>
              Endereços IP com mais tentativas de acesso negadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topBlockedIPs.length > 0 ? (
                metrics.topBlockedIPs.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-mono text-sm">{item.ip}</span>
                    </div>
                    <Badge variant="destructive">{item.count} tentativas</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum IP bloqueado nas últimas 24h
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atividades Suspeitas */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Suspeitas Recentes</CardTitle>
            <CardDescription>
              Eventos críticos que requerem atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.suspiciousActivities.length > 0 ? (
                metrics.suspiciousActivities.map((log) => (
                  <Alert key={log.id} variant={log.severity === 'critical' ? 'destructive' : 'default'}>
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(log.severity)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{log.event_type.replace(/_/g, ' ').toUpperCase()}</p>
                          <Badge variant={getSeverityColor(log.severity)}>{log.severity}</Badge>
                        </div>
                        <AlertDescription className="text-xs">
                          {log.ip_address && <span className="font-mono">IP: {log.ip_address}</span>}
                          {log.ip_address && ' • '}
                          {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma atividade suspeita detectada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
