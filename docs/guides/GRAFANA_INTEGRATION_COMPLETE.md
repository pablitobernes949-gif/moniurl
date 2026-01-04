# 📊 Guia Completo de Integração com Grafana

## 🎯 Visão Geral

Este guia mostra como conectar TODOS os gráficos e métricas do sistema de monitoramento ao Grafana, permitindo visualização completa e unificada de todos os serviços monitorados.

## 🚀 APIs Criadas

### 1. **Prometheus Metrics** (`/api/grafana/prometheus`)
Exporta 13 métricas em formato Prometheus:
- ✅ `service_up` - Status do serviço (1=up, 0=down)
- ⏱️ `service_latency_milliseconds` - Latência em ms
- 📊 `service_uptime_percentage` - Uptime percentual (0-100)
- 📉 `service_packet_loss_percentage` - Packet loss (0-100)
- 🔢 `service_checks_total` - Total de checks realizados
- ✅ `service_checks_success_total` - Total de checks bem-sucedidos
- ❌ `service_checks_failure_total` - Total de checks com falha
- ⚠️ `service_alerts_active` - Número de alertas ativos
- 📈 `service_latency_average_milliseconds` - Latência média
- 🎯 `service_success_rate` - Taxa de sucesso (0-100)
- ⏰ `service_seconds_since_last_check` - Tempo desde último check
- 🔒 `service_ssl_valid` - SSL válido (1=sim, 0=não)
- 📊 `service_status_by_type` - Status agrupado por tipo

### 2. **Time Series** (`/api/grafana/query`)
Endpoint para queries de séries temporais:
- Latência ao longo do tempo
- Status (up/down) ao longo do tempo
- Uptime percentual histórico
- Packet loss histórico
- Taxa de sucesso histórica

### 3. **Search** (`/api/grafana/search`)
Lista serviços e métricas disponíveis:
- Todos os serviços cadastrados
- Métricas disponíveis para cada serviço

### 4. **Annotations** (`/api/grafana/annotations`)
Eventos importantes no timeline:
- Alertas disparados
- Mudanças de status (up → down, down → up)
- Incidentes e recuperações

## 🔧 Configuração Passo a Passo

### **Passo 1: Iniciar o Sistema**

```bash
# Iniciar o servidor Next.js
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### **Passo 2: Configurar Data Sources no Grafana**

#### **Data Source 1: Prometheus**

1. Abra o Grafana: `http://localhost:3001`
2. Vá em **Configuration** → **Data Sources**
3. Clique em **Add data source**
4. Selecione **Prometheus**
5. Configure:
   ```
   Name: Service Monitor Prometheus
   URL: http://host.docker.internal:3000/api/grafana/prometheus
   (ou http://localhost:3000/api/grafana/prometheus se não usar Docker)
   
   Access: Server (default)
   Scrape interval: 30s
   ```
6. Clique em **Save & Test**

#### **Data Source 2: SimpleJSON**

1. Primeiro, instale o plugin SimpleJSON:
   ```bash
   grafana-cli plugins install grafana-simple-json-datasource
   # Ou via Docker:
   docker exec -it grafana grafana-cli plugins install grafana-simple-json-datasource
   docker restart grafana
   ```

2. Em **Configuration** → **Data Sources**
3. Clique em **Add data source**
4. Selecione **SimpleJSON**
5. Configure:
   ```
   Name: Service Monitor JSON
   URL: http://host.docker.internal:3000/api/grafana
   (ou http://localhost:3000/api/grafana se não usar Docker)
   
   Access: Server
   ```
6. Clique em **Save & Test**

### **Passo 3: Importar Dashboard Completo**

1. No Grafana, vá em **Dashboards** → **Import**
2. Copie o conteúdo de `config/grafana-dashboard-complete.json`
3. Cole no campo de importação
4. Selecione os data sources:
   - **Prometheus**: Service Monitor Prometheus
   - **SimpleJSON**: Service Monitor JSON
5. Clique em **Import**

## 📊 Painéis Disponíveis no Dashboard

### **Painéis em Tempo Real:**

1. **📊 Latência por Serviço (ms)**
   - Gráfico de linha mostrando latência de todos os serviços
   - Valores mín, máx, atual e média
   - Atualização: 30s

2. **✅ Status dos Serviços (Online/Offline)**
   - Gráfico de linha escalonada
   - 1 = Online, 0 = Offline
   - Visualização instantânea de disponibilidade

3. **📈 Uptime Percentual (%)**
   - Percentual de uptime de cada serviço
   - Threshold em 99.9%
   - Alerta visual quando abaixo do SLA

4. **📉 Packet Loss (%)**
   - Percentual de perda de pacotes
   - Identifica problemas de rede

5. **🎯 Taxa de Sucesso (%)**
   - Percentual de checks bem-sucedidos
   - Indicador de confiabilidade

### **Painéis de Estatísticas:**

6. **🟢 Serviços Online**
   - Contador de serviços ativos
   - Cores: Verde (5+), Amarelo (1-4), Vermelho (0)

7. **🔴 Serviços Offline**
   - Contador de serviços inativos
   - Cores: Verde (0), Amarelo (1-2), Vermelho (3+)

8. **⚠️ Alertas Ativos**
   - Número total de alertas não resolvidos
   - Cores baseadas em severidade

9. **📊 Total de Checks**
   - Contador total de health checks realizados
   - Mostra atividade do sistema

### **Painéis Analíticos:**

10. **📋 Resumo dos Serviços**
    - Tabela com status, latência e uptime
    - Visão consolidada de todos os serviços

11. **🎯 Uptime por Serviço**
    - Gráfico de barras horizontal
    - Comparação visual de uptime
    - Cores por threshold (95%, 99%)

12. **🔥 Heatmap de Latência**
    - Mapa de calor mostrando distribuição de latência
    - Identifica padrões e anomalias

13. **📉 Latência Média (ms)**
    - Série temporal de latência média
    - Tendências de performance

14. **⚠️ Alertas e Eventos**
    - Lista de alertas ativos
    - Priorização por severidade

## 🎨 Anotações no Timeline

O dashboard inclui anotações automáticas que aparecem nos gráficos:

- 🔴 **Alertas**: Marcadores vermelhos quando alertas são disparados
- 🟠 **Mudanças de Status**: Marcadores laranjas quando serviços mudam de estado
- 🔵 **Incidentes**: Eventos significativos de downtime

## 🔄 Queries Prometheus Disponíveis

Use estas queries para criar painéis personalizados:

### **Status e Disponibilidade:**
```promql
# Serviços online
sum(service_up)

# Serviços offline
count(service_up) - sum(service_up)

# Taxa de disponibilidade
(sum(service_up) / count(service_up)) * 100

# Uptime por serviço
service_uptime_percentage{service_name="API Principal"}
```

### **Performance:**
```promql
# Latência atual
service_latency_milliseconds

# Latência média
service_latency_average_milliseconds

# Top 5 serviços mais lentos
topk(5, service_latency_average_milliseconds)

# Latência P95
histogram_quantile(0.95, service_latency_milliseconds)
```

### **Confiabilidade:**
```promql
# Taxa de sucesso
service_success_rate

# Packet loss
service_packet_loss_percentage

# Checks totais
sum(service_checks_total)

# Taxa de falhas
(service_checks_failure_total / service_checks_total) * 100
```

### **Alertas:**
```promql
# Alertas ativos
sum(service_alerts_active)

# Alertas por serviço
service_alerts_active{service_name="API Principal"}

# Alertas por severidade
sum(service_alerts_active) by (severity)
```

## 🔍 Testando as APIs

### **Teste 1: Prometheus Metrics**
```bash
curl http://localhost:3000/api/grafana/prometheus
```

Resposta esperada:
```
# HELP service_up Service is up and running (1=up, 0=down)
# TYPE service_up gauge
service_up{service_id="1",service_name="API Principal",service_url="https://api.example.com",service_type="api"} 1
...
```

### **Teste 2: Time Series Query**
```bash
curl -X POST http://localhost:3000/api/grafana/query \
  -H "Content-Type: application/json" \
  -d '{
    "targets": [{"target": "latency"}],
    "range": {
      "from": "2026-01-04T00:00:00.000Z",
      "to": "2026-01-04T23:59:59.000Z"
    }
  }'
```

### **Teste 3: Search Services**
```bash
curl http://localhost:3000/api/grafana/search
```

### **Teste 4: Annotations**
```bash
curl -X POST http://localhost:3000/api/grafana/annotations \
  -H "Content-Type: application/json" \
  -d '{
    "range": {
      "from": "2026-01-04T00:00:00.000Z",
      "to": "2026-01-04T23:59:59.000Z"
    }
  }'
```

## 📱 Acesso Móvel

O dashboard é totalmente responsivo e pode ser acessado em:
- Desktop: `http://localhost:3001`
- Tablet: `http://[seu-ip]:3001`
- Mobile: `http://[seu-ip]:3001`

## 🔔 Configurar Alertas no Grafana

1. Em qualquer painel, clique no título → **Edit**
2. Vá na aba **Alert**
3. Configure condições, exemplo:
   ```
   WHEN avg() OF query(A, 5m, now) IS ABOVE 500
   ```
4. Configure notificações (email, Slack, webhook)

## 🚨 Troubleshooting

### **Dashboard não carrega dados:**
1. Verifique se o servidor Next.js está rodando
2. Teste as APIs manualmente com curl
3. Verifique os logs do Grafana
4. Confirme que os data sources estão configurados corretamente

### **Erro de CORS:**
- As APIs já incluem headers CORS adequados
- Se usar proxy reverso, configure CORS lá também

### **Métricas não aparecem:**
1. Verifique se há serviços cadastrados no sistema
2. Confirme que os health checks estão rodando
3. Verifique o banco de dados tem checks registrados

## 📚 Recursos Adicionais

### **Arquivos Criados:**
- `app/api/grafana/prometheus/route.ts` - Métricas Prometheus
- `app/api/grafana/query/route.ts` - Time series queries
- `app/api/grafana/search/route.ts` - Search endpoint
- `app/api/grafana/annotations/route.ts` - Anotações
- `config/grafana-dashboard-complete.json` - Dashboard completo

### **Endpoints Disponíveis:**
```
GET  /api/grafana/prometheus   - Métricas Prometheus
GET  /api/grafana/query         - Test connection
POST /api/grafana/query         - Time series data
GET  /api/grafana/search        - List services/metrics
POST /api/grafana/search        - Search query
POST /api/grafana/annotations   - Event annotations
```

## 🎉 Resultado Final

Após configurar tudo, você terá:

✅ 14 painéis visualizando todos os aspectos dos serviços  
✅ 13 métricas Prometheus disponíveis  
✅ Atualizações em tempo real (30s)  
✅ Anotações de alertas e eventos no timeline  
✅ Filtros por serviço e tipo  
✅ Alertas configuráveis  
✅ Dashboard responsivo  
✅ Histórico completo de todas as métricas  

**Tudo conectado e funcionando!** 🚀
