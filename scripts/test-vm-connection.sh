#!/bin/bash

# Script de teste de conectividade entre VMs Ubuntu
# Execute na VM do Grafana para testar conexão com a VM do Sistema

if [ -z "$1" ]; then
    echo "Uso: $0 <IP_VM1> [PORTA]"
    echo "Exemplo: $0 192.168.1.100 3000"
    exit 1
fi

VM1_IP="$1"
VM1_PORT="${2:-3000}"
BASE_URL="http://${VM1_IP}:${VM1_PORT}"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TESTE DE CONECTIVIDADE ENTRE VMs${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${CYAN}VM 1 (Sistema): ${BASE_URL}${NC}"
echo ""

tests_passed=0
tests_total=0

# Verificar se curl está instalado
if ! command -v curl &> /dev/null; then
    echo -e "${RED}[ERRO]${NC} curl não está instalado!"
    echo "Instale com: sudo apt-get install curl"
    exit 1
fi

# Teste de ping
echo -e "${YELLOW}Testando conectividade de rede...${NC}"
if ping -c 2 -W 3 "$VM1_IP" &> /dev/null; then
    echo -e "${GREEN}[OK]${NC} Ping - VM acessível"
else
    echo -e "${YELLOW}[AVISO]${NC} Ping falhou (pode estar bloqueado)"
    echo "Continuando com testes HTTP..."
fi

# Teste de porta TCP
echo ""
echo -e "${YELLOW}Testando porta TCP ${VM1_PORT}...${NC}"
if timeout 3 bash -c "cat < /dev/null > /dev/tcp/${VM1_IP}/${VM1_PORT}" 2>/dev/null; then
    echo -e "${GREEN}[OK]${NC} Porta ${VM1_PORT} - Aberta e acessível"
else
    echo -e "${RED}[ERRO]${NC} Porta ${VM1_PORT} - Timeout ou fechada"
    echo ""
    echo -e "${YELLOW}Verifique:${NC}"
    echo "  ${CYAN}•${NC} Sistema rodando na VM 1"
    echo "  ${CYAN}•${NC} Firewall liberado: sudo ufw allow ${VM1_PORT}/tcp"
    echo "  ${CYAN}•${NC} Status do firewall: sudo ufw status"
    echo ""
    exit 1
fi

echo ""
echo -e "${YELLOW}Testando endpoints da API...${NC}"
echo "─────────────────────────────────────"
echo ""

test_endpoint() {
    local name="$1"
    local endpoint="$2"
    local method="${3:-GET}"
    
    tests_total=$((tests_total + 1))
    
    echo -n "  ${name}... "
    
    local response
    if [ "$method" = "POST" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "{\"range\":{\"from\":\"$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S.000Z 2>/dev/null || date -u -v-1H +%Y-%m-%dT%H:%M:%S.000Z)\",\"to\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"}}" \
            "${BASE_URL}${endpoint}" 2>&1)
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${BASE_URL}${endpoint}" 2>&1)
    fi
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ OK (200)${NC}"
        tests_passed=$((tests_passed + 1))
        return 0
    else
        echo -e "${RED}✗ ERRO (${response})${NC}"
        return 1
    fi
}

# Executar testes
test_endpoint "Prometheus Metrics" "/api/grafana/prometheus"
test_endpoint "Query GET" "/api/grafana/query"
test_endpoint "Query POST" "/api/grafana/query" "POST"
test_endpoint "Search" "/api/grafana/search"
test_endpoint "Annotations" "/api/grafana/annotations" "POST"

# Teste detalhado do Prometheus
echo ""
echo -e "${YELLOW}Testando dados do Prometheus...${NC}"
metrics_response=$(curl -s --connect-timeout 5 "${BASE_URL}/api/grafana/prometheus" 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$metrics_response" ]; then
    metrics_count=$(echo "$metrics_response" | grep -c "^service_")
    if [ "$metrics_count" -gt 0 ]; then
        echo -e "${GREEN}[OK]${NC} Prometheus - ${metrics_count} métricas disponíveis"
        echo ""
        echo -e "${CYAN}Métricas encontradas:${NC}"
        echo "$metrics_response" | grep "^service_" | cut -d'{' -f1 | sort -u | head -5 | while read -r metric; do
            echo "  • $metric"
        done
    fi
fi

# Resumo
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}            RESUMO${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

percentage=0
if [ $tests_total -gt 0 ]; then
    percentage=$((tests_passed * 100 / tests_total))
fi

if [ $percentage -eq 100 ]; then
    color=$GREEN
elif [ $percentage -ge 60 ]; then
    color=$YELLOW
else
    color=$RED
fi

echo -e "${CYAN}Total de testes:${NC} ${tests_total}"
echo -e "${GREEN}Testes passados:${NC} ${tests_passed}"
echo -e "${RED}Testes falhos:${NC} $((tests_total - tests_passed))"
echo -e "${color}Taxa de sucesso: ${percentage}%${NC}"
echo ""

if [ $tests_passed -eq $tests_total ] && [ $tests_total -gt 0 ]; then
    echo -e "${GREEN}[✓] Todas as APIs estão acessíveis!${NC}"
    echo ""
    echo -e "${CYAN}Próximos passos:${NC}"
    echo ""
    echo -e "${YELLOW}1.${NC} No Grafana, adicione Data Source Prometheus:"
    echo "   ${CYAN}URL:${NC} ${BASE_URL}/api/grafana/prometheus"
    echo ""
    echo -e "${YELLOW}2.${NC} Adicione Data Source SimpleJSON:"
    echo "   ${CYAN}URL:${NC} ${BASE_URL}/api/grafana"
    echo "   ${CYAN}Plugin:${NC} grafana-cli plugins install grafana-simple-json-datasource"
    echo ""
    echo -e "${YELLOW}3.${NC} Importe o dashboard:"
    echo "   ${CYAN}Arquivo:${NC} config/grafana-dashboard-complete.json"
    echo ""
    exit 0
else
    echo -e "${YELLOW}[!] Alguns testes falharam!${NC}"
    echo ""
    echo -e "${CYAN}Verifique:${NC}"
    echo "  ${CYAN}•${NC} Sistema rodando na VM 1: ${BASE_URL}"
    echo "  ${CYAN}•${NC} Firewall da VM 1: sudo ufw allow ${VM1_PORT}/tcp"
    echo "  ${CYAN}•${NC} Status do serviço: sudo systemctl status npm"
    echo "  ${CYAN}•${NC} Logs do sistema: npm run dev ou pm2 logs"
    echo ""
    exit 1
fi

# Informações adicionais
echo "─────────────────────────────────────"
echo -e "${CYAN}Informações de configuração:${NC}"
echo "  VM 1 IP: ${VM1_IP}"
echo "  VM 1 Porta: ${VM1_PORT}"
echo "  Base URL: ${BASE_URL}"
echo ""
