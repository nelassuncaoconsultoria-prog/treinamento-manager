import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

type UserFormData = {
  email: string;
  name: string;
  storeId: number;
  role: 'user' | 'admin';
};

export default function Users() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: users = [], isLoading, refetch } = trpc.users.list.useQuery();
  const { data: stores = [] } = trpc.stores.list.useQuery();
  
  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsOpen(false);
      reset();
    },
  });

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      reset();
    },
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<UserFormData>({
    defaultValues: {
      role: 'user',
    },
  });

  const storeId = watch('storeId');

  const onSubmit = async (data: UserFormData) => {
    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        ...data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (userItem: any) => {
    setEditingId(userItem.id);
    setValue('email', userItem.email);
    setValue('name', userItem.name);
    setValue('storeId', userItem.storeId);
    setValue('role', userItem.role);
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      deleteMutation.mutate({ id });
    }
  };

  // Apenas admin pode gerenciar usuários
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar usuários.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
            <p className="text-gray-600 mt-2">Crie e gerencie usuários master vinculados a lojas</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingId(null);
                reset();
              }} className="gap-2">
                <Plus size={20} />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Usuário' : 'Criar Novo Usuário'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Atualize as informações do usuário' : 'Preencha os dados para criar um novo usuário master'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    placeholder="usuario@exemplo.com"
                    disabled={!!editingId}
                    {...register('email', { required: 'Email é obrigatório' })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input
                    placeholder="Nome do usuário"
                    {...register('name', { required: 'Nome é obrigatório' })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Loja</label>
                  <Select value={storeId?.toString() || ''} onValueChange={(value) => setValue('storeId', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma loja" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map(store => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.storeCode} - {store.storeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Função</label>
                  <Select defaultValue="user" onValueChange={(value) => setValue('role', value as 'user' | 'admin')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário Master</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Atualizar' : 'Criar'} Usuário
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">Carregando usuários...</p>
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">Nenhum usuário encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Usuários Cadastrados</CardTitle>
              <CardDescription>{users.length} usuário(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Loja</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(userItem => (
                      <TableRow key={userItem.id}>
                        <TableCell className="font-medium">{userItem.name}</TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>
                          {userItem.storeId ? (
                            stores.find(s => s.id === userItem.storeId)?.storeName || 'N/A'
                          ) : (
                            <span className="text-gray-500">Todas as lojas</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userItem.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {userItem.role === 'admin' ? 'Admin' : 'Master'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(userItem)}
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(userItem.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
