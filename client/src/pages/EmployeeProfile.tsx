import { useStore } from "@/hooks/useStore";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRoute } from "wouter";
import { Loader2, ArrowLeft, CheckCircle2, Clock, Download, Calendar } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from "react";

export default function EmployeeProfile() {
  const [, params] = useRoute("/employees/:id");
  const employeeId = params?.id ? parseInt(params.id) : null;
  const { selectedStoreId } = useStore();
  const { data: stores } = trpc.stores.list.useQuery();

  const { data: employee, isLoading: employeeLoading } = trpc.employees.get.useQuery(
    { id: employeeId || 0 },
    { enabled: !!employeeId }
  );

  const { data: assignments, isLoading: assignmentsLoading } = trpc.assignments.getByEmployee.useQuery(
    { employeeId: employeeId || 0 },
    { enabled: !!employeeId }
  );

  const { data: courses } = trpc.courses.list.useQuery(
    { storeId: selectedStoreId || 0 },
    { enabled: !!selectedStoreId }
  );

  const isLoading = employeeLoading || assignmentsLoading;

  if (isLoading || !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const selectedStore = stores?.find(s => s.id === selectedStoreId);
  const getCourseName = (id: number) => courses?.find(c => c.id === id)?.title || "N/A";
  const getCourseArea = (id: number) => courses?.find(c => c.id === id)?.area || "N/A";

  // Calcular estatísticas
  const totalCourses = assignments?.length || 0;
  const completedCourses = assignments?.filter(a => a.status === "concluido").length || 0;
  const pendingCourses = totalCourses - completedCourses;
  const completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  // Agrupar por status
  const completedAssignments = assignments?.filter(a => a.status === "concluido") || [];
  const pendingAssignments = assignments?.filter(a => a.status === "pendente") || [];

  // Dados para gráfico de progresso
  const progressData = [
    { name: "Concluídos", value: completedCourses, fill: "#10b981" },
    { name: "Pendentes", value: pendingCourses, fill: "#f59e0b" },
  ];

  // Dados para gráfico de timeline (últimos 6 meses)
  const timelineData = [
    { month: "Jan", concluidos: 0 },
    { month: "Fev", concluidos: 0 },
    { month: "Mar", concluidos: 0 },
    { month: "Abr", concluidos: 0 },
    { month: "Mai", concluidos: 0 },
    { month: "Jun", concluidos: completedCourses },
  ];

  // Agrupar por área
  const areaStats = {
    vendas: assignments?.filter(a => {
      const course = courses?.find(c => c.id === a.courseId);
      return course?.area === "vendas";
    }).length || 0,
    pos_vendas: assignments?.filter(a => {
      const course = courses?.find(c => c.id === a.courseId);
      return course?.area === "pos_vendas";
    }).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <a href="/employees">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </a>
        </Button>
      </div>

      {/* Informações do Funcionário */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{employee.name}</CardTitle>
              <CardDescription className="mt-2 text-base">
                <div className="space-y-1">
                  <p><strong>Função:</strong> {employee.function}</p>
                  <p><strong>Área:</strong> {employee.area === "vendas" ? "Vendas" : "Pós-Vendas"}</p>
                  <p><strong>Loja:</strong> {selectedStore?.storeCode} - {selectedStore?.storeName}</p>
                  <p><strong>Email:</strong> {employee.email}</p>
                </div>
              </CardDescription>
            </div>
            <Badge variant={employee.status === "ativo" ? "default" : "secondary"}>
              {employee.status === "ativo" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Atribuições</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Treinamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{pendingCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Treinamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Progresso geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Progresso */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Treinamentos</CardTitle>
            <CardDescription>Status atual de conclusão</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Linha - Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso ao Longo do Tempo</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="concluidos"
                  stroke="#10b981"
                  name="Concluídos"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Área */}
      <Card>
        <CardHeader>
          <CardTitle>Treinamentos por Área</CardTitle>
          <CardDescription>Distribuição entre Vendas e Pós-Vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Vendas</h3>
              <p className="text-3xl font-bold text-blue-600">{areaStats.vendas}</p>
              <p className="text-sm text-muted-foreground mt-1">Treinamentos</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Pós-Vendas</h3>
              <p className="text-3xl font-bold text-purple-600">{areaStats.pos_vendas}</p>
              <p className="text-sm text-muted-foreground mt-1">Treinamentos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Treinamentos Concluídos */}
      {completedAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Treinamentos Concluídos</CardTitle>
            <CardDescription>{completedAssignments.length} certificados obtidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-start justify-between border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-3 flex-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{getCourseName(assignment.courseId)}</h4>
                      <p className="text-sm text-muted-foreground">
                        Área: {getCourseArea(assignment.courseId) === "vendas" ? "Vendas" : "Pós-Vendas"}
                      </p>
                      {assignment.completedAt && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Concluído em {new Date(assignment.completedAt).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>
                  {assignment.certificateUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="ml-2"
                    >
                      <a href={assignment.certificateUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Treinamentos Pendentes */}
      {pendingAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Treinamentos Pendentes</CardTitle>
            <CardDescription>{pendingAssignments.length} em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-start justify-between border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-3 flex-1">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{getCourseName(assignment.courseId)}</h4>
                      <p className="text-sm text-muted-foreground">
                        Área: {getCourseArea(assignment.courseId) === "vendas" ? "Vendas" : "Pós-Vendas"}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Atribuído em {new Date(assignment.assignedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">Pendente</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há treinamentos */}
      {totalCourses === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum treinamento atribuído ainda</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
