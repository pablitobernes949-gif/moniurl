# 🚀 Guia de Deploy na EC2 - Service Monitor

## ❌ Problema Detectado: Connection Timeout

**Erro:** `kex_exchange_identification: read: Connection timed out`

### 🔧 Solução: Configurar Security Group

A instância EC2 está bloqueando conexões SSH. Você precisa liberar as portas no AWS Console.

---

## 📋 Passo a Passo para Liberar Portas

### 1. Acessar AWS Console
1. Entre em: https://console.aws.amazon.com/ec2/
2. Região: **US East (N. Virginia)** ou onde sua instância está
3. No menu lateral: **Instances**
4. Selecione sua instância: `18.215.174.193`

### 2. Configurar Security Group
1. Na aba **Security**, clique no **Security Group** (ex: `sg-xxxxx`)
2. Clique em **Edit inbound rules**
3. Adicione estas regras:

#### Regras Necessárias:

| Tipo | Protocolo | Porta | Origem | Descrição |
|------|-----------|-------|--------|-----------|
| SSH | TCP | 22 | Meu IP | Acesso SSH para deploy |
| HTTP | TCP | 80 | 0.0.0.0/0 | Acesso público ao monitor |
| HTTPS | TCP | 443 | 0.0.0.0/0 | (Opcional) HTTPS futuro |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | (Temporário) Teste direto |

**⚠️ IMPORTANTE:**
- Para **SSH (22)**: Use "**Meu IP**" para segurança
- Para **HTTP (80)**: Use "**0.0.0.0/0**" (acesso público)

### 3. Verificar se a Instância está Rodando
```bash
# No AWS Console, verifique:
- Instance State: "running" ✓
- Status Check: "2/2 checks passed" ✓
- Public IPv4: 18.215.174.193 ✓
```

---

## 🔄 Depois de Configurar o Security Group

### Testar Conexão SSH (no seu PC):
```powershell
# Teste 1: Ping (pode não funcionar se ICMP bloqueado)
Test-NetConnection -ComputerName 18.215.174.193 -Port 22

# Teste 2: SSH direto
ssh -i "C:\Users\michel.quaresma\Downloads\observium-01.pem" ubuntu@18.215.174.193
```

Se conectar com sucesso, você verá:
```
Welcome to Ubuntu ...
ubuntu@ip-xxx-xxx-xxx-xxx:~$
```

---

## 🚀 Script de Deploy Automático

Depois que o SSH funcionar, execute este script:

```powershell
# Salve como: deploy-ec2.ps1
$KEY_PATH = "C:\Users\michel.quaresma\Downloads\observium-01.pem"
$EC2_USER = "ubuntu"
$EC2_IP = "18.215.174.193"
$REPO_URL = "https://github.com/pablitobernes949-gif/moniurl.git"

Write-Host "🚀 Iniciando deploy do Service Monitor..." -ForegroundColor Green

# 1. Testar conexão
Write-Host "`n📡 Testando conexão SSH..." -ForegroundColor Yellow
ssh -i $KEY_PATH -o ConnectTimeout=10 "$EC2_USER@$EC2_IP" "echo '✓ Conectado!'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha na conexão SSH. Verifique Security Group!" -ForegroundColor Red
    exit 1
}

# 2. Instalar Docker
Write-Host "`n🐳 Instalando Docker..." -ForegroundColor Yellow
ssh -i $KEY_PATH "$EC2_USER@$EC2_IP" @"
    sudo apt update -qq
    sudo apt install -y docker.io docker-compose git
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ubuntu
    echo '✓ Docker instalado!'
"@

# 3. Clonar repositório
Write-Host "`n📦 Clonando repositório..." -ForegroundColor Yellow
ssh -i $KEY_PATH "$EC2_USER@$EC2_IP" @"
    rm -rf ~/service-monitoring-system
    git clone $REPO_URL ~/service-monitoring-system
    cd ~/service-monitoring-system
    echo '✓ Repositório clonado!'
"@

# 4. Criar .env
Write-Host "`n⚙️ Configurando ambiente..." -ForegroundColor Yellow
ssh -i $KEY_PATH "$EC2_USER@$EC2_IP" @"
    cd ~/service-monitoring-system
    echo 'DATABASE_URL=\"file:./prisma/monitoring.db\"' > .env
    echo '✓ Arquivo .env criado!'
"@

# 5. Build da imagem
Write-Host "`n🔨 Construindo imagem Docker..." -ForegroundColor Yellow
ssh -i $KEY_PATH "$EC2_USER@$EC2_IP" @"
    cd ~/service-monitoring-system
    sudo docker build -t service-monitor .
    echo '✓ Imagem construída!'
"@

# 6. Rodar container
Write-Host "`n🚀 Iniciando container..." -ForegroundColor Yellow
ssh -i $KEY_PATH "$EC2_USER@$EC2_IP" @"
    cd ~/service-monitoring-system
    sudo docker stop service-monitor 2>/dev/null || true
    sudo docker rm service-monitor 2>/dev/null || true
    sudo docker run -d \
        --name service-monitor \
        --restart unless-stopped \
        -p 80:3000 \
        -v \$(pwd)/prisma:/app/prisma \
        -e NODE_ENV=production \
        -e DATABASE_URL=\"file:./prisma/monitoring.db\" \
        service-monitor
    echo '✓ Container iniciado!'
    echo ''
    echo '🎉 Deploy concluído com sucesso!'
    echo '📍 Acesse: http://18.215.174.193'
"@

Write-Host "`n✅ Deploy finalizado!" -ForegroundColor Green
Write-Host "🌐 URL: http://18.215.174.193" -ForegroundColor Cyan
```

---

## 📝 Deploy Manual (Passo a Passo)

Se preferir fazer manualmente:

### 1. Conectar via SSH
```bash
ssh -i "C:\Users\michel.quaresma\Downloads\observium-01.pem" ubuntu@18.215.174.193
```

### 2. Instalar Docker
```bash
sudo apt update
sudo apt install -y docker.io git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
newgrp docker
```

### 3. Clonar e Configurar
```bash
git clone https://github.com/pablitobernes949-gif/moniurl.git ~/service-monitoring-system
cd ~/service-monitoring-system
echo 'DATABASE_URL="file:./prisma/monitoring.db"' > .env
```

### 4. Build e Run
```bash
docker build -t service-monitor .
docker run -d \
    --name service-monitor \
    --restart unless-stopped \
    -p 80:3000 \
    -v $(pwd)/prisma:/app/prisma \
    -e NODE_ENV=production \
    -e DATABASE_URL="file:./prisma/monitoring.db" \
    service-monitor
```

### 5. Verificar
```bash
docker ps
docker logs -f service-monitor
curl http://localhost:3000
```

---

## 🔍 Verificação Final

### No navegador:
```
http://18.215.174.193
```

### Comandos úteis SSH:
```bash
# Ver logs do container
docker logs -f service-monitor

# Reiniciar container
docker restart service-monitor

# Parar container
docker stop service-monitor

# Ver status
docker ps

# Acessar container
docker exec -it service-monitor sh
```

---

## 🐛 Troubleshooting

### Problema: Porta 80 ocupada
```bash
sudo netstat -tulpn | grep :80
sudo systemctl stop apache2  # Se houver Apache
```

### Problema: Container não inicia
```bash
docker logs service-monitor
# Ver erro específico
```

### Problema: Database error
```bash
docker exec -it service-monitor sh
cd prisma
npx prisma generate
npx prisma db push
```

### Atualizar aplicação:
```bash
cd ~/service-monitoring-system
git pull
docker build -t service-monitor .
docker stop service-monitor
docker rm service-monitor
docker run -d \
    --name service-monitor \
    --restart unless-stopped \
    -p 80:3000 \
    -v $(pwd)/prisma:/app/prisma \
    -e NODE_ENV=production \
    -e DATABASE_URL="file:./prisma/monitoring.db" \
    service-monitor
```

---

## ✅ Checklist Final

- [ ] Security Group configurado (portas 22, 80, 443)
- [ ] Conexão SSH funcionando
- [ ] Docker instalado
- [ ] Repositório clonado
- [ ] Container rodando
- [ ] Acesso HTTP funcionando (http://18.215.174.193)
- [ ] Database inicializado
- [ ] Serviços sendo monitorados

---

## 🎯 Próximos Passos (Opcional)

1. **Configurar Domínio:**
   ```bash
   # No registrador (GoDaddy, etc):
   # Criar registro A apontando para 18.215.174.193
   ```

2. **HTTPS com Let's Encrypt:**
   ```bash
   sudo apt install certbot
   sudo certbot --nginx -d seu-dominio.com
   ```

3. **Backup Automático:**
   ```bash
   # Criar cron job para backup do database
   crontab -e
   # Adicionar: 0 2 * * * /home/ubuntu/backup.sh
   ```

---

**Criado por:** GitHub Copilot
**Data:** 02/01/2026
**Versão:** 1.0
