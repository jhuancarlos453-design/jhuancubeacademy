# Cube Academy — primeira entrega

## Implementado
- Acesso real por e-mail/senha, Google com seleção de conta solicitada e Lovable.
- Perfil privado criado automaticamente no cadastro; sem senhas em dados de aplicação.
- Dados de treino privados em Cloud, isolados por usuário com políticas e permissões explícitas.
- Salvamento serializado com revisão para detectar alterações concorrentes e mensagens de falha.
- Importação opcional de dados antigos do mesmo e-mail, sem apagar os originais nem substituir registros de mesmo ID.
- Recuperação de senha e página pública para definir nova senha; confirmação de cadastro preservada.
- Idioma do documento corrigido para português.

## Áreas alteradas
`src/lib/store.tsx`, `src/lib/training-data.ts`, `src/lib/auth-config.ts`, `src/components/cube/AuthScreen.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/auth.tsx`, `src/routes/reset-password.tsx`, migração de perfis/dados privados e testes adjacentes.

## Verificado
- 11 testes passaram: médias existentes, penalidades, embaralhamento, validação, merge não destrutivo, seleção solicitada ao Google e rotas.
- Navegador: entrada por senha em duas contas de auditoria, registro de uma resolução, recarga, saída e troca para conta com histórico vazio.
- Requisição autenticada da segunda conta não retornou os dados da primeira.
- Página de recuperação sem link válido não apresentou formulário de nova senha.
- Capturas de computador e celular, sem excesso de largura no celular.
- Verificador de políticas sem alertas; versão atual sem erros de compilação.

## Limitações desta entrega
- Seleção de conta na tela real do Google não foi exercitada: parâmetro suportado configurado e provedor ativado, mas aprovação externa depende do titular.
- Cadastro via e-mail e recuperação completos não foram verificados com recebimento de mensagens. As contas de teste foram confirmadas para testar os demais fluxos; isso não altera a confirmação exigida no cadastro normal.
- Perfil preparado para nome/avatar/preferências; edição de perfil será uma entrega posterior.
- Dados locais pertencem ao navegador onde foram criados. É necessário criar/confirmar uma conta real do mesmo e-mail e escolher importar. Senhas antigas não são migradas.
- Senhas legadas já existentes no navegador não foram apagadas automaticamente; a aplicação não as lê nem as usa. Após verificar seus dados e guardar backup, o titular pode limpar os dados antigos do navegador.
- Google gerenciado não exige credenciais próprias do Google Cloud.

## Problemas encontrados para próximas etapas
- Timer: cancelamento de gestos/teclas, captura imutável do embaralhamento, foco em controles e confirmação de exclusão.
- Precisão: formatação na virada de minuto e consistência dos limites da inspeção.
- Backup: falta restauração JSON; CSV precisa neutralizar fórmulas de planilhas.
- Aprendizagem: diagramas OLL inconsistentes e ausência de reconhecimento visual PLL; validar com estados de cubo reais antes de expandir.
- Estatísticas: resultados de tipos de cubo diferentes ainda compartilham o timer 3×3.
- Conquistas: sem histórico permanente de desbloqueio; quiz necessita cancelamento de transições.
- Demais áreas do documento ainda não implementadas nesta entrega incremental.