import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CourseForm {
  title: string;
  description?: string;
  area: "vendas" | "pos_vendas";
  modality: "online" | "presencial" | "abraadiff";
}

export default function Courses() {
  const [open, setOpen] = useState(false);
  const { selectedStoreId, selectStore } = useStore();
  const { data: stores } = trpc.stores.list.useQuery();

  useEffect(() => {
    if (!selectedStoreId && stores && stores.length > 0) {
      selectStore(stores[0].id);
    }
  }, [stores, selectedStoreId, selectStore]);

  const { data: courses, isLoading, refetch } = trpc.courses.list.useQuery(
    { storeId: selectedStoreId || 0 },
    { enabled: !!selectedStoreId }
  );
  const createMutation = trpc.courses.create.useMutation();
  const deleteMutation = trpc.courses.delete.useMutation();
  const { register, handleSubmit, reset } = useForm<CourseForm>({
    defaultValues: {
      area: "vendas",
    },
  });

  const onSubmit = async (data: CourseForm) => {
    if (!selectedStoreId) {
      toast.error("Selecione uma loja");
      return;
    }
    try {
      await createMutation.mutateAsync({
        storeId: selectedStoreId,
        ...data,
      });
      toast.success("Curso criado com sucesso!");
      reset();
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao criar curso");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este curso?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Curso deletado com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar curso");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Cursos</h1>
          <p className="text-muted-foreground mt-2">Loja: {selectedStore?.storeCode} - {selectedStore?.storeName}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Curso</DialogTitle>
              <DialogDescription>
                Preencha os dados do curso para adicioná-lo ao sistema
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Curso</Label>
                <Input
                  id="title"
                  placeholder="Ex: Excel Avançado"
                  {...register("title", { required: true })}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição do curso"
                  {...register("description")}
                />
              </div>
              <div>
                <Label htmlFor="area">Área</Label>
                <Select defaultValue="vendas" onValueChange={(value) => {
                  register("area").onChange({ target: { value } });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="pos_vendas">Pós-Vendas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="modality">Modalidade</Label>
                <Select defaultValue="online" onValueChange={(value) => {
                  register("modality").onChange({ target: { value } });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="abraadiff">ABRAADIFF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Curso"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cursos</CardTitle>
          <CardDescription>Total: {courses?.length || 0} cursos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses?.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{course.description || "-"}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {course.area === "vendas" ? "Vendas" : "Pós-Vendas"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {course.modality === "online" ? "Online" : course.modality === "presencial" ? "Presencial" : "ABRAADIFF"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
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
