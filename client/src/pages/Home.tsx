import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Users, Target, CheckCircle2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Landing page with login integration
 * Shows login screen when not authenticated, redirects to dashboard when authenticated
 */
export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <p className="text-slate-300 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">TreinaManager</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Features */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Gestão de Treinamentos Corporativos
                </h2>
                <p className="text-xl text-slate-300">
                  Sistema completo para gerenciar treinamentos, funcionários e certificações em sua empresa.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500/20">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Gestão de Funcionários</h3>
                    <p className="text-slate-400">Organize funcionários por área, função e loja</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500/20">
                      <BookOpen className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Cursos Personalizados</h3>
                    <p className="text-slate-400">Crie cursos online, presenciais ou ABRAADIFF</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/20">
                      <Target className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Atribuições Inteligentes</h3>
                    <p className="text-slate-400">Atribua cursos automaticamente por função</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500/20">
                      <CheckCircle2 className="h-6 w-6 text-orange-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Certificações</h3>
                    <p className="text-slate-400">Rastreie conclusões e gere certificados</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Bem-vindo</h3>
                  <p className="text-slate-400">Faça login para acessar o TreinaManager</p>
                </div>

                <div className="space-y-4">
                  <a href={getLoginUrl()}>
                    <Button
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Fazer Login
                    </Button>
                  </a>

                  <p className="text-center text-sm text-slate-400 mt-6">
                    Ao fazer login, você concorda com nossos{" "}
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      Termos de Serviço
                    </a>
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-700/50">
                  <p className="text-xs text-slate-500 text-center">
                    TreinaManager v1.0 • Sistema de Gestão de Treinamentos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-700/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-sm">
                © 2026 TreinaManager. Todos os direitos reservados.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-slate-400 hover:text-slate-300 text-sm">
                  Privacidade
                </a>
                <a href="#" className="text-slate-400 hover:text-slate-300 text-sm">
                  Termos
                </a>
                <a href="#" className="text-slate-400 hover:text-slate-300 text-sm">
                  Contato
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // This shouldn't be reached due to redirect above, but just in case
  return null;
}
