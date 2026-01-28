import { useStore } from "@/hooks/useStore";
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
import { Loader2, Plus, CheckCircle2, Clock, Upload, Trash2, Download, File } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";

interface AssignmentForm {
  employeeId: number;
  courseId: number;
}

export default function Assignments() {
  const [open, setOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedStoreId, selectStore } = useStore();
  const { data: stores } = trpc.stores.list.useQuery();

  useEffect(() => {
    if (!selectedStoreId && stores && stores.length > 0) {
      selectStore(stores[0].id);
    }
  }, [stores, selectedStoreId, selectStore]);
  
  const { data: assignments, isLoading, refetch } = trpc.assignments.list.useQuery(
    { storeId: selectedStoreId || 0 },
    { enabled: !!selectedStoreId }
  );
  const { data: employees } = trpc.employees.list.useQuery(
    { storeId: selectedStoreId || 0 },
    { enabled: !!selectedStoreId }
  );
  const { data: courses } = trpc.courses.list.useQuery(
    { storeId: selectedStoreId || 0 },
    { enabled: !!selectedStoreId }
  );
  
  const createMutation = trpc.assignments.create.useMutation();
  const completeMutation = trpc.assignments.complete.useMutation();
  const deleteMutation = trpc.assignments.delete.useMutation();
  const uploadMutation = trpc.assignments.uploadCertificate.useMutation();
  
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
    if (!selectedStoreId) {
      toast.error("Selecione uma loja");
      return;
    }
    try {
      await createMutation.mutateAsync({
        storeId: selectedStoreId,
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

  const handleFileSelect = async (file: File, assignmentId: number) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado. Use PDF, JPG ou PNG.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setUploadingId(assignmentId);
    try {
      const buffer = await file.arrayBuffer();
      await uploadMutation.mutateAsync({
        assignmentId,
        fileName: file.name,
        fileBuffer: new Uint8Array(buffer) as any,
      });
      toast.success("Certificado enviado com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao fazer upload do certificado");
    } finally {
      setUploadingId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, assignmentId: number) => {
    e.preventDefault();
    setDragOverId(assignmentId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, assignmentId: number) => {
    e.preventDefault();
    setDragOverId(null);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0], assignmentId);
    }
  };

  if (isLoading || !selectedStoreId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const selectedStore = stores?.find(s => s.id === selectedStoreId);
  const getEmployeeName = (id: number) => employees?.find(e => e.id === id)?.name || "N/A";
  const getCourseName = (id: number) => courses?.find(c => c.id === id)?.title || "N/A";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Atribuição de Cursos</h1>
          <p className="text-muted-foreground mt-2">Loja: {selectedStore?.storeCode} - {selectedStore?.storeName}</p>
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
                  <TableHead>Certificado</TableHead>
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
                      {assignment.certificateUrl ? (
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-blue-600" />
                          <a 
                            href={assignment.certificateUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Ver
                          </a>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => handleDragOver(e, assignment.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, assignment.id)}
                          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                            dragOverId === assignment.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = ".pdf,.jpg,.jpeg,.png";
                            input.onchange = (e: any) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileSelect(file, assignment.id);
                              }
                            };
                            input.click();
                          }}
                        >
                          {uploadingId === assignment.id ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-gray-600">Enviando...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Upload className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-600">Clique ou arraste</span>
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(assignment.assignedAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {assignment.status === "pendente" && !assignment.certificateUrl && (
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
                      {assignment.certificateUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={assignment.certificateUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
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
