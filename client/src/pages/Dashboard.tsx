import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2, Users, BookOpen, CheckCircle2, AlertCircle } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stores, isLoading: storesLoading } = trpc.stores.list.useQuery();
  const { selectedStoreId, selectStore } = useStore();

  // Se não há loja selecionada e temos lojas disponíveis, selecionar a primeira
  useEffect(() => {
    if (!selectedStoreId && stores && stores.length > 0) {
      selectStore(stores[0].id);
    }
  }, [stores, selectedStoreId, selectStore]);

  const { data: assignments, isLoading: assignmentsLoading } = trpc.assignments.list.useQuery(
    { storeId: selectedStoreId || 0 },
    { enabled: !!selectedStoreId }
  );
  const { data: employees, isLoading: employeesLoading } = trpc.employees.list.useQuery(
    { storeId: selectedStoreId || 0 },
    { enabled: !!selectedStoreId }
  );
  const { data: courses, isLoading: coursesLoading } = trpc.courses.list.useQuery(
    { storeId: selectedStoreId || 0 },
    { enabled: !!selectedStoreId }
  );
  const { data: reportByArea, isLoading: reportLoading } = trpc.reports.trainingProgressByArea.useQuery(
    { storeId: selectedStoreId || 0 },
    { enabled: !!selectedStoreId }
  );

  const selectedStore = stores?.find(s => s.id === selectedStoreId);

  if (storesLoading || !selectedStoreId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const completedAssignments = assignments?.filter(a => a.status === "concluido").length || 0;
  const pendingAssignments = assignments?.filter(a => a.status === "pendente").length || 0;
  const totalAssignments = assignments?.length || 0;
  const completionPercentage = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  // Dados para gráfico de progresso por área
  const areaChartData = reportByArea?.map(area => ({
    name: area.area,
    Concluído: area.completedCourses,
    Pendente: area.pendingCourses,
    Percentual: area.completionPercentage,
  })) || [];

  // Dados para gráfico de pizza
  const pieData = [
    { name: "Concluído", value: completedAssignments },
    { name: "Pendente", value: pendingAssignments },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Treinamentos</h1>
          <p className="text-muted-foreground mt-2">Bem-vindo, {user?.name}! Acompanhe o progresso dos treinamentos.</p>
        </div>
        <div className="w-64">
          <label className="text-sm font-medium mb-2 block">Selecionar Loja</label>
          <Select
            value={selectedStoreId?.toString() || ""}
            onValueChange={(value) => selectStore(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma loja" />
            </SelectTrigger>
            <SelectContent>
              {stores?.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.storeCode} - {store.storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedStore && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Loja Selecionada</p>
            <p className="text-xl font-semibold">{selectedStore.storeCode} - {selectedStore.storeName}</p>
            <p className="text-sm text-muted-foreground">{selectedStore.city}</p>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Funcionários ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Cursos disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treinamentos Concluídos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAssignments}</div>
            <p className="text-xs text-muted-foreground">De {totalAssignments} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <p className="text-xs text-muted-foreground">Progresso geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Barras - Progresso por Área */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso por Área</CardTitle>
            <CardDescription>Treinamentos concluídos vs pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={areaChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Concluído" fill="#10b981" />
                <Bar dataKey="Pendente" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição Geral */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição Geral</CardTitle>
            <CardDescription>Status de todos os treinamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Área */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportByArea?.map(area => (
          <Card key={area.area}>
            <CardHeader>
              <CardTitle>{area.area}</CardTitle>
              <CardDescription>{area.totalEmployees} funcionários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Taxa de Conclusão</span>
                    <span className="text-sm font-bold">{area.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${area.completionPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Concluídos</p>
                    <p className="text-lg font-bold text-green-600">{area.completedCourses}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pendentes</p>
                    <p className="text-lg font-bold text-amber-600">{area.pendingCourses}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
