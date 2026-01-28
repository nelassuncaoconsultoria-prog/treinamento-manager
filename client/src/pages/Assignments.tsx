import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, CheckCircle2, Clock, Upload, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AssignmentForm {
  employeeId: number;
  courseId: number;
}

export default function Assignments() {
  const [open, setOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  
  const { data: assignments, isLoading, refetch } = trpc.assignments.list.useQuery();
  const { data: employees } = trpc.employees.list.useQuery();
  const { data: courses } = trpc.courses.list.useQuery();
  
  const createMutation = trpc.assignments.create.useMutation();
  const completeMutation = trpc.assignments.complete.useMutation();
  const deleteMutation = trpc.assignments.delete.useMutation();
  
  const { register, handleSubmit, reset, watch } = useForm<AssignmentForm>({
    defaultValues: {
      employeeId: 0,
      courseId: 0,
    },
  });

  const onSubmit = async (data: AssignmentForm) => {
    if (!data.employeeId || !data.courseId) {
      toast.error("Selecione um funcionário e um curso");
      return;
    }
    try {
      await createMutation.mutateAsync({
        employeeId: Number(data.employeeId),
        courseId: Number(data.courseId),
      });
      toast.success("Curso atribuído com sucesso!");
      reset();
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao atribuir curso");
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await completeMutation.mutateAsync({
        id,
        certificateUrl: "",
        certificateKey: "",
      });
      toast.success("Treinamento marcado como concluído!");
      refetch();
    } catch (error) {
      toast.error("Erro ao completar treinamento");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta atribuição?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Atribuição deletada com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar atribuição");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const getEmployeeName = (id: number) => employees?.find(e => e.id === id)?.name || "N/A";
  const getCourseName = (id: number) => courses?.find(c => c.id === id)?.title || "N/A";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Atribuição de Cursos</h1>
          <p className="text-muted-foreground mt-2">Atribua cursos aos funcionários e acompanhe o progresso</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Atribuir Curso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Novo Curso</DialogTitle>
              <DialogDescription>
                Selecione um funcionário e um curso para atribuição
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="employee">Funcionário</Label>
                <Select onValueChange={(value) => {
                  register("employeeId").onChange({ target: { value: Number(value) } });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="course">Curso</Label>
                <Select onValueChange={(value) => {
                  register("courseId").onChange({ target: { value: Number(value) } });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Atribuindo..." : "Atribuir Curso"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atribuições de Cursos</CardTitle>
          <CardDescription>Total: {assignments?.length || 0} atribuições</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Atribuição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments?.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{getEmployeeName(assignment.employeeId)}</TableCell>
                    <TableCell>{getCourseName(assignment.courseId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {assignment.status === "concluido" ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Concluído
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Pendente
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(assignment.assignedAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {assignment.status === "pendente" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleComplete(assignment.id)}
                          disabled={completeMutation.isPending}
                          title="Marcar como concluído"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(assignment.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
