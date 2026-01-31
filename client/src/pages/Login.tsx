import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const utils = trpc.useUtils();
  
  const loginMutation = trpc.auth.localLogin.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch auth.me query
      await utils.auth.me.invalidate();
      // Wait a bit then redirect
      setTimeout(() => {
        setLocation('/dashboard');
      }, 200);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">TM</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">TreinaManager</CardTitle>
          <CardDescription className="text-center">
            Gestão de Treinamentos Corporativos
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Fazer Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer com logo e texto "Desenvolvido por" */}
      <div className="mt-16 flex items-center gap-6 text-gray-700">
        <span className="text-sm font-medium">Desenvolvido por</span>
        <img 
          src="/nel-logo.png" 
          alt="Nel Assunção Consultoria" 
          className="h-20 object-contain" 
          style={{ filter: 'brightness(0) saturate(100%)' }}
        />
      </div>
    </div>
  );
}
