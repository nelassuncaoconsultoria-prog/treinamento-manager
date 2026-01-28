# TreinaManager - TODO

## Fase 1: Estrutura Base
- [x] Inicializar projeto com banco de dados e autenticação
- [x] Definir schema do banco de dados
- [x] Criar migrations do banco de dados

## Fase 2: Integração Google Drive
- [x] Configurar Google Drive API
- [x] Implementar autenticação com Google Drive
- [x] Criar estrutura de pastas automática (módulo pronto)

## Fase 3: Backend - APIs
- [x] Implementar CRUD de funcionários
- [x] Implementar CRUD de cursos
- [x] Implementar CRUD de atribuições de cursos
- [x] Implementar upload de certificados (estrutura pronta)
- [x] Implementar geração de relatórios
- [x] Implementar notificações ao owner

## Fase 4: Frontend - Interface
- [x] Criar layout base com sidebar
- [x] Implementar página de login/autenticação
- [x] Criar dashboard principal
- [x] Implementar gerenciamento de funcionários
- [x] Implementar gerenciamento de cursos
- [x] Implementar atribuição de cursos
- [x] Implementar upload de certificados (interface pronta)
- [x] Criar página de relatórios

## Fase 5: Testes e Validação
- [x] Testes unitários do backend
- [ ] Testes de integração
- [x] Validação de fluxos completos
- [ ] Documentação do sistema

## Funcionalidades Principais
- [x] Autenticação de usuários master (admin)
- [x] Cadastro de funcionários com função e área
- [x] Cadastro de cursos de treinamento
- [x] Atribuição de cursos aos funcionários
- [x] Upload de certificados em PDF (estrutura pronta)
- [x] Organização automática no Google Drive (módulo pronto)
- [x] Dashboard com progresso de treinamentos
- [x] Relatórios por função
- [x] Notificações ao owner
- [x] Interface com sidebar de navegação


## Melhoria: Sistema de Lojas
- [x] Atualizar schema para incluir tabela de lojas
- [x] Adicionar campo storeId em employees, courses e assignments
- [x] Criar migrations do banco de dados
- [x] Implementar APIs de seleção de loja
- [x] Criar seletor de lojas no dashboard
- [x] Filtrar dados por loja selecionada
- [x] Testar isolamento de dados por loja
- [x] Validar relatórios por loja
- [x] Atualizar todas as páginas com contexto de loja
- [x] Implementar hook useStore para persistência de seleção
