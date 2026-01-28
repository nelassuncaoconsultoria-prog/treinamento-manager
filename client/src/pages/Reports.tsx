import { trpc } from "@/lib/trpc";
import { useStore } from "@/hooks/useStore";
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
import { Loader2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Reports() {
  const { selectedStoreId, selectStore } = useStore();
  const { data: stores } = trpc.stores.list.useQuery();

  useEffect(() => {
    if (!selectedStoreId && stores && stores.length > 0) {
      selectStore(stores[0].id);
    }
  }, [stores, selectedStoreId, selectStore]);

  const { data: reportByFunction, isLoading: functionLoading } = trpc.reports.trainingProgressByFunction.useQuery(
    { storeId: selectedStoreId || 0 },
    { enabled: !!selectedStoreId }
  );
  const { data: reportByArea, isLoading: areaLoading } = trpc.reports.trainingProgressByArea.useQuery(
    { storeId: selectedStoreId || 0 },
    { enabled: !!selectedStoreId }
  );

  if (functionLoading || areaLoading || !selectedStoreId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const selectedStore = stores?.find(s => s.id === selectedStoreId);

  // Preparar dados para gráfico de funções
  const functionChartData = reportByFunction?.map(func => ({
    name: func.function,
    "Taxa de Conclusão": func.completionPercentage,
    "Concluídos": func.completedCourses,
    "Pendentes": func.pendingCourses,
  })) || [];

  // Preparar dados para gráfico de áreas
  const areaChartData = reportByArea?.map(area => ({
    name: area.area,
    "Taxa de Conclusão": area.completionPercentage,
    "Concluídos": area.completedCourses,
    "Pendentes": area.pendingCourses,
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Relatórios de Treinamento</h1>
        <p className="text-muted-foreground mt-2">Loja: {selectedStore?.storeCode} - {selectedStore?.storeName}</p>
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
              <Bar dataKey="Taxa de Conclusão" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Progresso por Área */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso por Área</CardTitle>
          <CardDescription>Comparação entre Vendas e Pós-Vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={areaChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Taxa de Conclusão" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Concluídos" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="Pendentes" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela Detalhada por Função */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Função</CardTitle>
          <CardDescription>Informações detalhadas de cada função</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Função</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Total de Funcionários</TableHead>
                  <TableHead>Cursos Concluídos</TableHead>
                  <TableHead>Cursos Pendentes</TableHead>
                  <TableHead>Taxa de Conclusão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportByFunction?.map((func) => (
                  <TableRow key={func.function}>
                    <TableCell className="font-medium">{func.function}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {func.area === "vendas" ? "Vendas" : "Pós-Vendas"}
                      </span>
                    </TableCell>
                    <TableCell>{func.totalEmployees}</TableCell>
                    <TableCell>
                      <span className="text-green-600 font-semibold">{func.completedCourses}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-amber-600 font-semibold">{func.pendingCourses}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${func.completionPercentage}%` }}
                          />
                        </div>
                        <span className="font-bold">{func.completionPercentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
            {reportByArea?.map((area) => (
              <Card key={area.area} className="border">
                <CardHeader>
                  <CardTitle className="text-lg">{area.area}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Funcionários</p>
                      <p className="text-2xl font-bold">{area.totalEmployees}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                      <p className="text-2xl font-bold text-blue-600">{area.completionPercentage}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Concluídos</p>
                      <p className="text-xl font-semibold text-green-600">{area.completedCourses}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                      <p className="text-xl font-semibold text-amber-600">{area.pendingCourses}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Progresso</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${area.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                  {Object.keys(area.functions).length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Funções:</p>
                      <ul className="space-y-1 text-sm">
                        {Object.entries(area.functions).map(([func, data]: [string, any]) => (
                          <li key={func} className="flex justify-between">
                            <span>{func}</span>
                            <span className="text-muted-foreground">{data.totalEmployees} funcionários</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
