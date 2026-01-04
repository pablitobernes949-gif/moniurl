# 📊 Integração com Grafana - Service Monitor

## 🎯 Visão Geral

Este guia mostra como configurar o Grafana para visualizar todos os dados do Service Monitor em dashboards profissionais.

### Endpoints Disponíveis

| Endpoint | Descrição | Formato |
|----------|-----------|---------|
| `/api/metrics` | Métricas gerais | JSON / Prometheus |
| `/api/metrics?format=prometheus` | Formato Prometheus | Text |
| `/api/metrics/timeseries` | Séries temporais | JSON |
| `/api/metrics/query` | Query de métricas | JSON |
| `/api/metrics/search` | Busca de serviços | JSON |

---

## 🐳 OPÇÃO 1: Grafana com Docker (Mais Rápido)

### Passo 1: Instalar Grafana na EC2

```bash
# Conectar na EC2
ssh -i "C:\Users\michel.quaresma\Downloads\observium-01.pem" ubuntu@18.215.174.193

# Rodar Grafana com Docker
docker run -d \
  --name grafana \
  --restart unless-stopped \
  -p 3001:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=admin123 \
  -e GF_INSTALL_PLUGINS=grafana-simple-json-datasource \
  -v grafana-storage:/var/lib/grafana \
  grafana/grafana:latest

# Verificar se está rodando
docker ps | grep grafana
docker logs -f grafana
```

### Passo 2: Acessar Grafana

```
URL: http://18.215.174.193:3001
Usuário: admin
Senha: admin123
```

**⚠️ IMPORTANTE:** Adicione regra no Security Group da EC2:
- Type: Custom TCP
- Port: 3001
- Source: 0.0.0.0/0 (ou Meu IP)

---

## 📡 OPÇÃO 2: Instalar Grafana Direto no Sistema

```bash
# Adicionar repositório
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -

# Instalar
sudo apt-get update
sudo apt-get install grafana

# Iniciar
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

# Verificar
sudo systemctl status grafana-server
```

Acesso: `http://18.215.174.193:3000`

---

## ⚙️ Configurar Datasource no Grafana

### Método 1: SimpleJSON (Recomendado)

1. **Acessar:** Configuration → Data Sources → Add data source
2. **Buscar:** "SimpleJson" ou "JSON API"
3. **Configurar:**
   ```
   Name: ServiceMonitor
   URL: http://localhost/api/metrics/timeseries
   (ou http://service-monitor/api/metrics/timeseries se estiver na mesma rede Docker)
   ```
4. **Test & Save**

### Método 2: Prometheus

1. **Add data source** → **Prometheus**
2. **URL:** `http://localhost/api/metrics?format=prometheus`
3. **Scrape interval:** `30s`
4. **Test & Save**

### Método 3: JSON API Plugin

```bash
# Instalar plugin
docker exec -it grafana grafana-cli plugins install simpod-json-datasource
docker restart grafana
```

Configurar:
- **URL:** `http://localhost/api/metrics`
- **Custom HTTP Headers:**
  - Header: `Content-Type`
  - Value: `application/json`

---

## 📊 Importar Dashboard Pronto

### Opção A: Via Interface

1. **Menu:** Dashboards → Import
2. **Copiar conteúdo** de `grafana-dashboard.json`
3. **Colar** e clicar em **Load**
4. **Selecionar datasource:** ServiceMonitor
5. **Import**

### Opção B: Via API

```bash
# Na EC2 ou localmente
curl -X POST http://18.215.174.193:3001/api/dashboards/db \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d @grafana-dashboard.json
```

---

## 🎨 Criar Dashboard Manualmente

### Panel 1: Latência em Tempo Real

1. **Add Panel** → **Graph**
2. **Query:**
   ```
   Metric: latency
   Service: Selecionar ou "All"
   ```
3. **Visualization:**
   - Type: Graph
   - Lines: Yes
   - Fill: 1
   - Line width: 2
4. **Axes:**
   - Left Y: Milliseconds (ms)
   - X: Time
5. **Legend:**
   - Show: Yes
   - As Table: Yes
   - To the right: Yes
   - Values: Min, Max, Avg, Current

### Panel 2: Uptime Percentage

1. **Add Panel** → **Stat**
2. **Query:** `uptime`
3. **Visualization:**
   - Calculation: Last (not null)
   - Unit: Percent (0-100)
   - Thresholds:
     - Base: Red (< 90%)
     - 90: Orange
     - 99: Green

### Panel 3: Status Atual

1. **Add Panel** → **Stat**
2. **Query:** `status`
3. **Value mappings:**
   - 0 → "Offline" (Red)
   - 1 → "Online" (Green)
4. **Color mode:** Background

### Panel 4: Packet Loss

1. **Add Panel** → **Graph**
2. **Query:** `packet_loss`
3. **Alert Rule:**
   - Condition: WHEN avg() OF query(A, 5m, now) IS ABOVE 10
   - Evaluate every: 1m
   - For: 5m

---

## 🔍 Queries Avançadas

### Latência Média por Hora
```
Query: latency
Aggregation: Average
Group by: 1h
```

### Uptime nos Últimos 7 Dias
```
Query: uptime
Time range: Last 7 days
Aggregation: Average
```

### Alertas de Serviços Offline
```
Query: status
Condition: value < 1
Alert if: true for 5 minutes
```

---

## 📈 Painéis Recomendados

### Dashboard Executivo
- **Uptime Geral** (Gauge 0-100%)
- **Serviços Online vs Offline** (Stat)
- **Latência Média** (Gauge em ms)
- **Incidentes nas Últimas 24h** (Counter)

### Dashboard Técnico
- **Latência por Serviço** (Multi-line graph)
- **Packet Loss Timeline** (Area graph)
- **Check History** (Table)
- **Response Time Distribution** (Histogram)

### Dashboard de Alertas
- **Serviços com Problemas** (List)
- **Histórico de Incidentes** (Timeline)
- **SLA Tracking** (Stat panels)

---

## 🔔 Configurar Alertas no Grafana

### 1. Configurar Notification Channel

**Menu:** Alerting → Notification channels → New channel

#### Email
```
Type: Email
Addresses: seu-email@empresa.com
Send test: Verificar recebimento
```

#### Slack
```
Type: Slack
Webhook URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
Username: Grafana Monitor
Channel: #alertas
```

#### Discord
```
Type: Discord
Webhook URL: https://discord.com/api/webhooks/YOUR_WEBHOOK
```

### 2. Criar Regra de Alerta

Em qualquer painel:
1. **Edit Panel** → **Alert tab**
2. **Create Alert**
3. **Conditions:**
   ```
   WHEN avg() OF query(A, 5m, now)
   IS BELOW 1
   ```
4. **Notification:** Selecionar canal criado
5. **Message:** Customizar mensagem

### 3. Alertas Sugeridos

**Serviço Offline:**
```
Condition: status IS BELOW 1 FOR 5 minutes
Notification: Email + Slack
Message: "🔴 Serviço {{$labels.service}} está OFFLINE!"
```

**Latência Alta:**
```
Condition: latency IS ABOVE 500 FOR 10 minutes
Notification: Slack
Message: "⚠️ Latência de {{$labels.service}} está em {{$value}}ms"
```

**Packet Loss Alto:**
```
Condition: packet_loss IS ABOVE 10 FOR 5 minutes
Notification: Email
Message: "📉 Packet loss de {{$labels.service}}: {{$value}}%"
```

---

## 🌐 Acessar de Qualquer Lugar

### Com Nginx Reverse Proxy

```bash
# Instalar nginx
sudo apt install nginx

# Configurar
sudo nano /etc/nginx/sites-available/grafana

# Adicionar:
server {
    listen 80;
    server_name grafana.seudominio.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Ativar
sudo ln -s /etc/nginx/sites-available/grafana /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Com HTTPS (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d grafana.seudominio.com
```

---

## 📊 Exemplo de Dashboard Completo

```json
{
  "title": "Service Monitor - Overview",
  "panels": [
    {
      "title": "Total de Serviços",
      "type": "stat",
      "targets": [{ "expr": "count(service_status)" }]
    },
    {
      "title": "Serviços Online",
      "type": "stat",
      "targets": [{ "expr": "count(service_status == 1)" }],
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "thresholds" },
          "thresholds": {
            "steps": [
              { "value": null, "color": "green" }
            ]
          }
        }
      }
    },
    {
      "title": "Latência por Serviço (24h)",
      "type": "timeseries",
      "targets": [{ "expr": "service_latency_milliseconds" }]
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Grafana não conecta ao datasource

**Erro:** "Failed to fetch data"

**Solução:**
```bash
# Se Grafana e Service Monitor estão em containers diferentes
docker network create monitoring
docker network connect monitoring service-monitor
docker network connect monitoring grafana

# Usar URL: http://service-monitor/api/metrics/timeseries
```

### Dados não aparecem

**Verificar:**
```bash
# Teste direto no endpoint
curl http://localhost/api/metrics

# Ver logs do container
docker logs service-monitor | grep metrics

# Verificar banco de dados
docker exec -it service-monitor sh
cd prisma
ls -la monitoring.db
```

### Porta 3001 bloqueada

**AWS Console → EC2 → Security Groups → Edit inbound rules:**
```
Type: Custom TCP
Port: 3001
Source: 0.0.0.0/0
```

---

## 🚀 Docker Compose Completo (Service Monitor + Grafana)

Crie `docker-compose.monitoring.yml`:

```yaml
version: '3.8'

services:
  service-monitor:
    build: .
    container_name: service-monitor
    restart: unless-stopped
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./prisma/monitoring.db
    volumes:
      - ./prisma:/app/prisma
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_INSTALL_PLUGINS=grafana-simple-json-datasource
    volumes:
      - grafana-storage:/var/lib/grafana
      - ./grafana-dashboard.json:/var/lib/grafana/dashboards/service-monitor.json
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  grafana-storage:
```

Rodar:
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

---

## ✅ Checklist Final

- [ ] Grafana instalado e rodando
- [ ] Porta 3001 liberada no Security Group
- [ ] Acesso ao Grafana (admin/admin123)
- [ ] Datasource configurado e testado
- [ ] Dashboard importado
- [ ] Painéis mostrando dados
- [ ] Alertas configurados
- [ ] Notificações testadas

---

## 📚 Recursos Adicionais

- **Grafana Docs:** https://grafana.com/docs/
- **Dashboard Gallery:** https://grafana.com/grafana/dashboards/
- **Alert Rules:** https://grafana.com/docs/grafana/latest/alerting/

---

**URLs de Acesso:**
- Service Monitor: http://18.215.174.193
- Grafana: http://18.215.174.193:3001
- Métricas JSON: http://18.215.174.193/api/metrics
- Métricas Prometheus: http://18.215.174.193/api/metrics?format=prometheus

**Credenciais Grafana:**
- Usuário: `admin`
- Senha: `admin123` (trocar na primeira conexão)

---

**Criado por:** GitHub Copilot  
**Data:** 02/01/2026  
**Versão:** 1.0
