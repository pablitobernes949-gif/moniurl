# 🔄 Instruções de Reorganização do Projeto

## Passo a Passo (EXECUTAR NA ORDEM)

### 1️⃣ Reorganizar Arquivos
```cmd
reorganize-final.cmd
```

**O que faz:**
- Cria toda a estrutura de pastas
- Move arquivos lib/ para database/, monitoring/, utils/, initialization/
- Move componentes para modals/, panels/, cards/, charts/, providers/
- Move scripts, docker e config para pastas dedicadas
- Usa `git mv` para rastrear movimentos

**Tempo estimado:** 10-15 segundos

---

### 2️⃣ Atualizar Imports
```cmd
update-imports-final.cmd
```

**O que faz:**
- Atualiza todos os imports @/lib/* para novos caminhos
- Atualiza imports @/components/* para novos caminhos
- Corrige paths relativos em arquivos lib/
- Mostra quantos arquivos foram atualizados

**Tempo estimado:** 5-10 segundos

---

### 3️⃣ Testar Build
```cmd
npm run build
```

**Resultado esperado:**
- ✅ Build bem-sucedido
- ⚠️ Apenas warnings sobre pacotes AWS (opcional)
- ❌ Zero erros de module not found

---

### 4️⃣ Commitar Mudanças
```cmd
git add .
git commit -m "feat: reorganize project structure into logical folders"
```

---

## 📁 Estrutura Final

```
lib/
├── database/          (db.ts, storage.ts, db-operations.ts)
├── monitoring/        (monitoring.ts, alerts.ts, realtime.ts, aws-realtime.ts)
├── utils/             (utils.ts, types.ts)
└── initialization/    (init.ts, seed.ts, worker.ts)

components/
├── modals/            (7 dialogs/modals)
├── panels/            (alerts-panel, trends-dashboard, incident-history)
├── cards/             (service-card, service-stats, sla-metrics)
├── charts/            (service-chart, service-details-chart)
├── providers/         (theme-provider, theme-provider-enhanced)
└── ui/                (componentes shadcn/ui)

scripts/               (check-db.js, migrate-services.js, test-*.*)
docker/                (Dockerfile, docker-compose.yml, .dockerignore)
config/                (grafana-dashboard.json, server.log)
docs/
├── architecture/      (ARCHITECTURE.md, BACKEND_API.md, etc)
└── deployment/        (DEPLOY_EC2.md, DEPLOY_MANUAL.md)
```

---

## ⚠️ Importante

- **NÃO interrompa** os scripts durante execução
- **NÃO execute** comandos antigos do histórico do PowerShell
- **AGUARDE** cada script terminar completamente
- Se algo der errado: `git reset --hard HEAD` e recomece

---

## 🆘 Troubleshooting

### Erro "arquivo não encontrado"
- Certifique-se de que `git reset --hard HEAD` foi executado
- Verifique se está na raiz do projeto

### Erro "git mv failed"
- Algum arquivo já foi movido ou não existe
- Execute `git status` para ver o estado atual
- Pode precisar de `git reset --hard HEAD`

### Build com erros de imports
- Execute `update-imports-final.cmd` novamente
- Verifique erros específicos e corrija manualmente se necessário

---

## 📊 Checklist de Verificação

Após executar tudo:

- [ ] `git status` mostra arquivos movidos (R) e modificados (M)
- [ ] `npm run build` executa sem erros
- [ ] Todos os arquivos lib/ estão em subpastas
- [ ] Todos os componentes estão organizados
- [ ] Scripts/docker/config movidos
- [ ] Imports atualizados (sem @/lib/types, etc)
