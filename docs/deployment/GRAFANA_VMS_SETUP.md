# 🔗 Configuração Grafana em VMs Separadas

## 🏗️ Arquitetura

```
┌─────────────────────────────────────┐
│    VM 1 - Sistema de Monitoramento  │
│    IP: [SEU_IP_VM1]                 │
│    Porta: 3000                      │
│                                     │
│    APIs Disponíveis:                │
│    - /api/grafana/prometheus        │
│    - /api/grafana/query             │
│    - /api/grafana/search            │
│    - /api/grafana/annotations       │
└─────────────────────────────────────┘
                 ↑
                 │ HTTP Requests
                 │
┌─────────────────────────────────────┐
│    VM 2 - Grafana                   │
│    IP: [SEU_IP_VM2]                 │
│    Porta: 3000 (Grafana)            │
│                                     │
│    Data Sources:                    │
│    - Prometheus                     │
│    - SimpleJSON                     │
└─────────────────────────────────────┘
```

## 📋 Pré-requisitos

### **VM 1 (Sistema de Monitoramento):**
- ✅ Next.js rodando na porta 3000
- ✅ Firewall liberado para porta 3000
- ✅ IP acessível da VM 2

### **VM 2 (Grafana):**
- ✅ Grafana instalado e rodando
- ✅ Acesso HTTP à VM 1
- ✅ Plugin SimpleJSON instalado

## 🚀 Passo a Passo

### **Passo 1: Configurar VM 1 (Sistema de Monitoramento)**

#### 1.1 - Verificar IP da VM
```bash
# Linux/Mac
ip addr show
# ou
hostname -I

# Windows
ipconfig
```

Anote o IP: `___________________`

#### 1.2 - Iniciar o Sistema
```bash
npm run dev
# ou para produção:
npm run build
npm start
```

#### 1.3 - Liberar Firewall (se necessário)

**Linux (Ubuntu/Debian):**
```bash
sudo ufw allow 3000/tcp
sudo ufw status
```

**CentOS/RHEL:**
```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

**Windows:**
```powershell
New-NetFirewallRule -DisplayName "Next.js Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

#### 1.4 - Testar Acesso Local
```bash
curl http://localhost:3000/api/grafana/prometheus
```

Deve retornar métricas Prometheus.

### **Passo 2: Testar Conectividade entre VMs**

**Na VM 2 (Grafana), teste conexão com VM 1:**

```bash
# Substituir [IP_VM1] pelo IP real da VM 1
curl http://[IP_VM1]:3000/api/grafana/prometheus

# Exemplo:
curl http://192.168.1.100:3000/api/grafana/prometheus
```

Se retornar erro:
- ❌ Verificar firewall da VM 1
- ❌ Verificar se o sistema está rodando
- ❌ Verificar se as VMs estão na mesma rede ou com rotas configuradas

### **Passo 3: Configurar Data Sources no Grafana (VM 2)**

#### 3.1 - Instalar Plugin SimpleJSON
```bash
# Dentro do container/VM do Grafana
grafana-cli plugins install grafana-simple-json-datasource

# Se estiver usando Docker:
docker exec -it grafana grafana-cli plugins install grafana-simple-json-datasource
docker restart grafana

# Ou adicione ao docker-compose.yml:
# environment:
#   - GF_INSTALL_PLUGINS=grafana-simple-json-datasource
```

#### 3.2 - Adicionar Data Source Prometheus

1. Acesse Grafana: `http://[IP_VM2]:3000`
2. Login (admin/admin por padrão)
3. Vá em **Configuration** → **Data Sources** → **Add data source**
4. Selecione **Prometheus**
5. Configure:

```yaml
Name: Service Monitor Prometheus
URL: http://[IP_VM1]:3000/api/grafana/prometheus
Access: Server (default)
HTTP Method: GET
```

**Importante:** Use o IP da VM 1, não localhost!

6. Clique em **Save & Test**

#### 3.3 - Adicionar Data Source SimpleJSON

1. **Add data source** → **SimpleJSON**
2. Configure:

```yaml
Name: Service Monitor JSON
URL: http://[IP_VM1]:3000/api/grafana
Access: Server
```

3. Clique em **Save & Test**

### **Passo 4: Importar Dashboard**

1. Vá em **Dashboards** → **Import**
2. Copie o conteúdo de `config/grafana-dashboard-complete.json` da VM 1
3. Cole no campo de importação
4. Selecione os data sources:
   - **Prometheus:** Service Monitor Prometheus
   - **SimpleJSON:** Service Monitor JSON
5. Clique em **Import**

## 🔧 Configuração Avançada

### **Usar HTTPS (Recomendado para Produção)**

#### VM 1 - Nginx como Reverse Proxy

```nginx
# /etc/nginx/sites-available/monitoring
server {
    listen 443 ssl http2;
    server_name monitoring.seudominio.com;

    ssl_certificate /etc/ssl/certs/monitoring.crt;
    ssl_certificate_key /etc/ssl/private/monitoring.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # CORS headers (se necessário)
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
}
```

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/monitoring /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Agora use no Grafana:
```
URL: https://monitoring.seudominio.com/api/grafana/prometheus
```

### **Docker Compose Completo**

Salve como `docker-compose.yml` na VM 2:

```yaml
version: '3.8'

services:
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_INSTALL_PLUGINS=grafana-simple-json-datasource
      - GF_SERVER_ROOT_URL=http://[IP_VM2]:3000
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    restart: unless-stopped

volumes:
  grafana-data:
```

Iniciar:
```bash
docker-compose up -d
```

### **Provisionar Data Sources Automaticamente**

Crie `grafana/provisioning/datasources/datasources.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Service Monitor Prometheus
    type: prometheus
    access: proxy
    url: http://[IP_VM1]:3000/api/grafana/prometheus
    isDefault: true
    editable: true

  - name: Service Monitor JSON
    type: grafana-simple-json-datasource
    access: proxy
    url: http://[IP_VM1]:3000/api/grafana
    isDefault: false
    editable: true
```

Substitua `[IP_VM1]` pelo IP real da VM 1.

## 🧪 Script de Teste de Conectividade

Salve como `test-vm-connection.sh` na VM 2:

```bash
#!/bin/bash

# Configuração
VM1_IP="[IP_VM1]"  # Substitua pelo IP real
VM1_PORT="3000"
BASE_URL="http://${VM1_IP}:${VM1_PORT}"

echo "========================================"
echo "  TESTE DE CONECTIVIDADE ENTRE VMs"
echo "========================================"
echo ""
echo "VM 1 (Sistema): ${BASE_URL}"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

tests_passed=0
tests_total=0

test_endpoint() {
    local name=$1
    local endpoint=$2
    local method=${3:-GET}
    
    tests_total=$((tests_total + 1))
    
    echo -n "Testando ${name}... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d '{"range":{"from":"'$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S.000Z)'","to":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}' \
            "${BASE_URL}${endpoint}" 2>&1)
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${endpoint}" 2>&1)
    fi
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ OK (200)${NC}"
        tests_passed=$((tests_passed + 1))
    else
        echo -e "${RED}✗ ERRO (${response})${NC}"
    fi
}

# Executar testes
test_endpoint "Prometheus Metrics" "/api/grafana/prometheus"
test_endpoint "Query GET" "/api/grafana/query"
test_endpoint "Query POST" "/api/grafana/query" "POST"
test_endpoint "Search" "/api/grafana/search"
test_endpoint "Annotations" "/api/grafana/annotations" "POST"

# Resumo
echo ""
echo "========================================"
echo "            RESUMO"
echo "========================================"
echo "Total: ${tests_total} testes"
echo -e "${GREEN}Passou: ${tests_passed}${NC}"
echo -e "${RED}Falhou: $((tests_total - tests_passed))${NC}"

if [ $tests_passed -eq $tests_total ]; then
    echo -e "\n${GREEN}✓ Todos os testes passaram!${NC}"
    echo "As VMs estão conectadas corretamente."
    exit 0
else
    echo -e "\n${YELLOW}⚠ Alguns testes falharam.${NC}"
    echo "Verifique:"
    echo "  - Firewall da VM 1"
    echo "  - Sistema rodando na VM 1"
    echo "  - Conectividade de rede entre VMs"
    exit 1
fi
```

Executar:
```bash
chmod +x test-vm-connection.sh
./test-vm-connection.sh
```

## 🔍 Troubleshooting

### **Problema: "Connection refused"**

**Causa:** Firewall bloqueando ou serviço não rodando

**Solução:**
```bash
# VM 1 - Verificar se está rodando
netstat -tulpn | grep :3000
# ou
ss -tulpn | grep :3000

# Verificar firewall
sudo ufw status  # Ubuntu/Debian
sudo firewall-cmd --list-all  # CentOS/RHEL
```

### **Problema: "Timeout"**

**Causa:** Rota de rede não configurada

**Solução:**
```bash
# VM 2 - Testar ping
ping [IP_VM1]

# Testar telnet
telnet [IP_VM1] 3000

# Se não funcionar, verificar rotas:
ip route
# ou
route -n
```

### **Problema: "CORS error" no Grafana**

**Causa:** Headers CORS não configurados

**Solução:** As APIs já têm CORS configurado, mas se necessário, adicione no nginx:

```nginx
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
```

### **Problema: "Data source test failed"**

**Causa:** URL incorreta ou formato inválido

**Solução:**
- ✅ Use IP, não hostname (a menos que DNS esteja configurado)
- ✅ Não use `localhost` ou `127.0.0.1`
- ✅ Use o IP da interface de rede, não loopback
- ✅ Formato: `http://192.168.1.100:3000/api/grafana/prometheus`

## 📊 URLs Finais

Após configurar tudo:

- **Sistema de Monitoramento:** `http://[IP_VM1]:3000`
- **Grafana:** `http://[IP_VM2]:3000`
- **Dashboard:** `http://[IP_VM2]:3000/dashboards`

## ✅ Checklist Final

- [ ] VM 1: Sistema rodando e acessível
- [ ] VM 1: Firewall liberado na porta 3000
- [ ] VM 2: Grafana instalado e rodando
- [ ] VM 2: Plugin SimpleJSON instalado
- [ ] Conectividade: VM 2 consegue acessar VM 1
- [ ] Data Source Prometheus configurado com IP da VM 1
- [ ] Data Source SimpleJSON configurado com IP da VM 1
- [ ] Dashboard importado
- [ ] Painéis mostrando dados

**Tudo configurado e funcionando!** 🎉
