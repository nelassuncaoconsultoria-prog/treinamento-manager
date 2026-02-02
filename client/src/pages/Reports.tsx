import { trpc } from "@/lib/trpc";
import { useStore } from "@/hooks/useStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ProgressData {
  total: number;
  completed: number;
  percentage: number;
}

export default function Reports() {
  const { user } = useAuth();
  const { selectedStoreId, selectStore } = useStore();
  const { data: stores } = trpc.stores.list.useQuery();

  useEffect(() => {
    if (user && user.storeId) {
      selectStore(user.storeId);
    }
  }, [user, selectStore]);

  const storeIdToUse = user?.storeId || selectedStoreId || 0;

  const { data: reportByFunction, isLoading: functionLoading } = trpc.reports.trainingProgressByFunction.useQuery(
    { storeId: storeIdToUse },
    { enabled: !!storeIdToUse }
  );
  const { data: reportByArea, isLoading: areaLoading } = trpc.reports.trainingProgressByArea.useQuery(
    { storeId: storeIdToUse },
    { enabled: !!storeIdToUse }
  );
  const { data: overallProgress } = trpc.reports.overallProgress.useQuery(
    { storeId: storeIdToUse },
    { enabled: !!storeIdToUse }
  );

  if (functionLoading || areaLoading || !storeIdToUse) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const selectedStore = stores?.find(s => s.id === selectedStoreId);

  // Preparar dados para gráfico de funções
  const functionChartData = reportByFunction ? Object.entries(reportByFunction).map(([func, data]) => ({
    name: func,
    "Taxa de Conclusão": data.percentage,
    "Concluídos": data.completed,
    "Pendentes": data.total - data.completed,
  })) : [];

  // Preparar dados para gráfico de áreas
  const areaChartData = reportByArea ? Object.entries(reportByArea).map(([area, data]) => ({
    name: area === "vendas" ? "Vendas" : "Pós-Vendas",
    "Taxa de Conclusão": data.percentage,
    "Concluídos": data.completed,
    "Pendentes": data.total - data.completed,
  })) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Relatórios de Treinamento</h1>
        <p className="text-muted-foreground mt-2">Loja: {selectedStore?.storeCode} - {selectedStore?.storeName}</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Treinamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Atribuições ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallProgress?.completed || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Treinamentos finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{overallProgress?.pending || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando conclusão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{overallProgress?.percentage || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Progresso geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Progresso por Função */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso por Função</CardTitle>
          <CardDescription>Taxa de conclusão de treinamentos por cargo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={functionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Concluídos" fill="#10b981" />
              <Bar dataKey="Pendentes" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela Detalhada por Função */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Função</CardTitle>
          <CardDescription>Resumo de progresso por cargo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Função</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Concluídos</TableHead>
                  <TableHead>Pendentes</TableHead>
                  <TableHead>Taxa de Conclusão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportByFunction && Object.entries(reportByFunction).map(([func, data]: [string, ProgressData]) => (
                  <TableRow key={func}>
                    <TableCell className="font-medium">{func}</TableCell>
                    <TableCell>{data.total}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {data.completed}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {data.total - data.completed}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                        <span className="font-bold">{data.percentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Progresso por Área */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso por Área</CardTitle>
          <CardDescription>Taxa de conclusão por área de atuação</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={areaChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Concluídos" fill="#10b981" />
              <Bar dataKey="Pendentes" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela Detalhada por Área */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Área</CardTitle>
          <CardDescription>Resumo de progresso por área de atuação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportByArea && Object.entries(reportByArea).map(([area, data]: [string, ProgressData]) => (
              <Card key={area} className="border">
                <CardHeader>
                  <CardTitle className="text-lg">{area === "vendas" ? "Vendas" : "Pós-Vendas"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Treinamentos</p>
                      <p className="text-2xl font-bold">{data.total}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Concluídos</p>
                      <p className="text-2xl font-bold text-green-600">{data.completed}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                      <p className="text-2xl font-bold text-amber-600">{data.total - data.completed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa</p>
                      <p className="text-2xl font-bold text-blue-600">{data.percentage}%</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm font-bold">{data.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
