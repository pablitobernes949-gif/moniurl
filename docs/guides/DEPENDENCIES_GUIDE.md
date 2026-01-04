# 🔗 Sistema de Dependências entre Serviços

## ✨ Funcionalidades Implementadas

### 1. Gerenciamento de Dependências
- **Definir dependências** entre serviços (ex: Frontend → API → Banco de Dados)
- **Tipos de dependência**:
  - **Obrigatória**: Serviço crítico para funcionamento
  - **Opcional**: Serviço complementar

### 2. Diagrama Visual Interativo
- **Canvas HTML5** com visualização em grafo
- **Layout automático** em camadas (topological sort)
- **Interativo**:
  - Clique em nó para ver detalhes
  - Zoom in/out
  - Cores indicam status (verde=online, vermelho=offline)
  - Setas mostram direção da dependência

### 3. Alertas em Cascata
- **Detecção automática** de dependências offline
- **Avisos visuais** quando dependência crítica está fora
- **Badge de alerta** mostrando quantos serviços estão comprometidos

### 4. Proteções de Segurança
- **Prevenção de dependências circulares**: Não permite A → B → A
- **Validação de existência**: Só permite dependências de serviços válidos
- **Unicidade**: Não permite duplicar mesma dependência

## 📍 Como Usar

### Adicionar Dependência a um Serviço

1. **Via Menu do Card**:
   - Clique nos 3 pontos (⋮) no card do serviço
   - Selecione "Dependências"
   - Escolha o serviço dependente
   - Selecione o tipo (Obrigatória/Opcional)
   - Clique em "+"

2. **Exemplo Real**:
   ```
   Frontend SEFA → API SEFA → Banco de Dados
   ```
   - Frontend depende da API (obrigatória)
   - API depende do Banco (obrigatória)
   - Frontend depende do CDN (opcional)

### Visualizar Diagrama Completo

1. Clique no botão **"Diagrama"** no header
2. Veja todos os serviços e suas relações
3. **Clique em um nó** para ver:
   - Status atual
   - Latência
   - Uptime
   - Lista de dependências
4. Use os botões de zoom para ajustar visualização

### Entender Alertas de Dependência

**No Header**:
- Quando uma dependência crítica cai, aparece:
  ```
  ⚠️ 2 serviços críticos
  ```

**Barra de Alerta**:
- Mostra lista de serviços afetados
- Clique no chip para ver detalhes

**No Card**:
- Badge vermelho "Obrigatória" indica dependência crítica offline

## 🎨 Interface

### Modal de Dependências
```
┌─────────────────────────────────────┐
│ Dependências de Frontend SEFA       │
├─────────────────────────────────────┤
│ Adicionar:                          │
│ [Selecionar Serviço ▼] [Tipo ▼] +  │
│                                     │
│ Dependências configuradas (2):      │
│ ┌─────────────────────────────────┐ │
│ │ Frontend → API        [Obrig] ✗ │ │
│ │ Frontend → CDN        [Opc]   ✗ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⚠️ Dependência API está offline     │
└─────────────────────────────────────┘
```

### Diagrama de Dependências
```
┌──────────────────────────────────────────┐
│            [Banco de Dados] 🟢           │
│                    ↑                     │
│                    │                     │
│              [API SEFA] 🟢               │
│                    ↑                     │
│         ┌──────────┴──────────┐         │
│         │                     │         │
│   [Frontend Web] 🟢    [App Mobile] 🔴  │
│                                          │
│ Zoom: [+] [-]                            │
└──────────────────────────────────────────┘
```

## 🔧 API Endpoints

### GET `/api/services/[id]/dependencies`
Retorna dependências e dependentes de um serviço
```json
{
  "dependencies": [
    {
      "id": "dep_123",
      "dependencyId": "api_456",
      "type": "required",
      "dependency": {
        "id": "api_456",
        "name": "API SEFA",
        "status": "online"
      }
    }
  ],
  "dependents": [
    {
      "serviceId": "mobile_789",
      "service": {
        "name": "App Mobile"
      }
    }
  ],
  "hasCriticalDependencies": false
}
```

### POST `/api/services/[id]/dependencies`
Adiciona nova dependência
```json
{
  "dependencyId": "service_xyz",
  "type": "required", // ou "optional"
  "description": "Descrição opcional"
}
```

### DELETE `/api/services/[id]/dependencies/[depId]`
Remove uma dependência

## 💾 Estrutura do Banco de Dados

```prisma
model ServiceDependency {
  id            String   @id @default(cuid())
  serviceId     String   // Serviço que tem a dependência
  dependencyId  String   // Serviço do qual depende
  
  service       Service  @relation("ServiceDependencies")
  dependency    Service  @relation("DependentServices")
  
  type          String   @default("required") // "required" ou "optional"
  description   String?
  createdAt     DateTime @default(now())

  @@unique([serviceId, dependencyId])
}
```

## 🎯 Casos de Uso

### 1. Monitoramento de Infraestrutura
```
Load Balancer → Web Servers → Cache Redis → Database
                            → Queue RabbitMQ
```

### 2. Microserviços
```
API Gateway → Auth Service
          → User Service → Database
          → Payment Service → External API
```

### 3. Sistema SEFA
```
Portal SEFA → API Backend → Banco Oracle
          → CDN (opcional)
          → Service Bus
```

## 🚨 Alertas Automáticos

### Quando Dependência Obrigatória Cai:
1. **Header**: Badge vermelho com contador
2. **Barra de Alerta**: Lista de serviços afetados
3. **Card**: Indicador visual no próprio serviço
4. **Modal de Dependências**: Aviso destacado

### Quando Dependência Opcional Cai:
- Aviso discreto no modal
- Não gera alerta crítico
- Serviço continua como "online"

## 🎨 Cores e Indicadores

| Status | Cor | Significado |
|--------|-----|-------------|
| 🟢 Verde | Online | Serviço funcionando normalmente |
| 🔴 Vermelho | Offline | Serviço fora do ar |
| 🟡 Amarelo | Instável | Alta latência ou packet loss |
| ⚠️ Alerta | Âmbar | Dependência crítica offline |

## 📊 Análise de Impacto

O diagrama mostra:
- **Serviços upstream**: Quais dependem deste
- **Serviços downstream**: De quais este depende
- **Impacto em cascata**: Se um serviço cai, quantos são afetados

**Exemplo**:
```
Se "Banco de Dados" cair:
  → API fica comprometida (1 serviço)
  → Frontend fica comprometido (2 serviços)
  → App Mobile fica comprometido (3 serviços)
  
TOTAL: 3 serviços afetados em cascata
```

## ✅ Validações Implementadas

1. ✅ **Não permite dependência circular**: A → B → A
2. ✅ **Não permite duplicatas**: Mesmo serviço duas vezes
3. ✅ **Valida existência**: Só serviços cadastrados
4. ✅ **Integridade referencial**: Ao deletar serviço, remove dependências
5. ✅ **Índices de performance**: Queries rápidas mesmo com muitos dados

## 🚀 Próximos Passos Sugeridos

1. **Notificações por email** quando dependência crítica cai
2. **Histórico de impactos**: Registrar quando cascata aconteceu
3. **SLA compartilhado**: Calcular disponibilidade considerando dependências
4. **Export/Import**: Exportar grafo de dependências
5. **Sugestões automáticas**: ML para sugerir dependências baseado em padrões

---

**Criado em**: 03/01/2026  
**Versão**: 1.0  
**Status**: ✅ Funcional e Testado
