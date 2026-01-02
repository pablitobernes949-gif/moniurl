# 🚀 Deploy Manual na AWS EC2 - Passo a Passo

## ✅ Informações da sua EC2
- **IP:** 18.215.174.193
- **Usuário:** ubuntu
- **Chave:** C:\Users\michel.quaresma\Downloads\observium-01.pem

---

## 📋 PASSO 1: Configurar Security Group no AWS Console

### 1.1 Acessar AWS Console
1. Abra: https://console.aws.amazon.com/ec2/
2. Faça login com suas credenciais AWS
3. Certifique-se que está na região correta (ex: **us-east-1**)

### 1.2 Encontrar sua Instância
1. No menu lateral esquerdo, clique em **"Instances"**
2. Localize a instância com IP: **18.215.174.193**
3. Clique na instância para selecioná-la

### 1.3 Editar Security Group
1. Na parte inferior, clique na aba **"Security"**
2. Clique no link do **Security Group** (algo como `sg-xxxxxxxxx`)
3. Clique no botão **"Edit inbound rules"**

### 1.4 Adicionar Regras
Clique em **"Add rule"** e adicione cada uma dessas regras:

**Regra 1 - SSH:**
- Type: `SSH`
- Protocol: `TCP`
- Port Range: `22`
- Source: `My IP` (recomendado) ou `0.0.0.0/0` (menos seguro)
- Description: `SSH Access`

**Regra 2 - HTTP:**
- Type: `HTTP`
- Protocol: `TCP`
- Port Range: `80`
- Source: `0.0.0.0/0`
- Description: `Service Monitor`

**Regra 3 - HTTPS (opcional):**
- Type: `HTTPS`
- Protocol: `TCP`
- Port Range: `443`
- Source: `0.0.0.0/0`
- Description: `HTTPS Access`

### 1.5 Salvar
- Clique em **"Save rules"**
- Aguarde alguns segundos para as regras serem aplicadas

---

## 📋 PASSO 2: Testar Conexão SSH

Abra o **PowerShell** no seu computador e execute:

```powershell
ssh -i "C:\Users\michel.quaresma\Downloads\observium-01.pem" ubuntu@18.215.174.193
```

**Se aparecer uma pergunta sobre autenticidade, digite:** `yes` e pressione Enter

**Você deve ver algo como:**
```
Welcome to Ubuntu...
ubuntu@ip-xxx-xxx-xxx-xxx:~$
```

✅ **Se conectou?** Ótimo! Continue para o Passo 3.
❌ **Não conectou?** Volte ao Passo 1 e verifique se liberou a porta 22.

---

## 📋 PASSO 3: Atualizar Sistema e Instalar Docker

Agora que você está conectado via SSH, execute estes comandos **um por vez**:

### 3.1 Atualizar pacotes do sistema
```bash
sudo apt update
```

### 3.2 Instalar Docker e Git
```bash
sudo apt install -y docker.io git
```

### 3.3 Iniciar Docker
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### 3.4 Adicionar seu usuário ao grupo Docker
```bash
sudo usermod -aG docker ubuntu
```

### 3.5 Aplicar permissões (sem precisar fazer logout)
```bash
newgrp docker
```

### 3.6 Verificar se Docker está funcionando
```bash
docker --version
```

**Deve mostrar:** `Docker version 24.x.x` ou similar

---

## 📋 PASSO 4: Clonar o Repositório

### 4.1 Clonar projeto do GitHub
```bash
git clone https://github.com/pablitobernes949-gif/moniurl.git ~/service-monitoring-system
```

### 4.2 Entrar na pasta do projeto
```bash
cd ~/service-monitoring-system
```

### 4.3 Verificar se baixou corretamente
```bash
ls -la
```

**Você deve ver:** `Dockerfile`, `package.json`, `app/`, `components/`, etc.

---

## 📋 PASSO 5: Configurar Arquivo .env

### 5.1 Criar arquivo .env
```bash
echo 'DATABASE_URL="file:./prisma/monitoring.db"' > .env
```

### 5.2 Verificar se foi criado
```bash
cat .env
```

**Deve mostrar:** `DATABASE_URL="file:./prisma/monitoring.db"`

---

## 📋 PASSO 6: Build da Imagem Docker

### 6.1 Construir imagem (pode demorar 5-10 minutos)
```bash
docker build -t service-monitor .
```

**Aguarde até ver:** `Successfully tagged service-monitor:latest`

### 6.2 Verificar se a imagem foi criada
```bash
docker images | grep service-monitor
```

**Deve aparecer:** Uma linha com `service-monitor` e o tamanho da imagem

---

## 📋 PASSO 7: Rodar o Container

### 7.1 Parar container antigo (se existir)
```bash
docker stop service-monitor 2>/dev/null || true
docker rm service-monitor 2>/dev/null || true
```

### 7.2 Iniciar novo container
```bash
docker run -d \
    --name service-monitor \
    --restart unless-stopped \
    -p 80:3000 \
    -v $(pwd)/prisma:/app/prisma \
    -e NODE_ENV=production \
    -e DATABASE_URL="file:./prisma/monitoring.db" \
    service-monitor
```

**Deve retornar:** Um ID longo (hash do container)

### 7.3 Verificar se está rodando
```bash
docker ps
```

**Deve mostrar:** Uma linha com `service-monitor` e status `Up`

### 7.4 Ver os logs (Ctrl+C para sair)
```bash
docker logs -f service-monitor
```

**Deve ver:** Mensagens do Next.js iniciando, algo como:
```
▲ Next.js 16.0.10
- Local: http://localhost:3000
✓ Ready in 2s
```

---

## 📋 PASSO 8: Testar se Está Funcionando

### 8.1 Testar dentro da EC2
```bash
curl http://localhost
```

**Deve retornar:** HTML da página (muito texto)

### 8.2 Testar no seu navegador
Abra o navegador no seu computador e acesse:

```
http://18.215.174.193
```

**Você deve ver:** A página do Service Monitor! 🎉

---

## 🎯 PASSO 9: Verificações Finais

### 9.1 Status do container
```bash
docker ps
```

### 9.2 Ver logs em tempo real
```bash
docker logs -f service-monitor
```
(Pressione `Ctrl+C` para sair)

### 9.3 Ver uso de recursos
```bash
docker stats service-monitor
```
(Pressione `Ctrl+C` para sair)

---

## 🔄 Comandos Úteis para o Dia a Dia

### Reiniciar o serviço
```bash
docker restart service-monitor
```

### Parar o serviço
```bash
docker stop service-monitor
```

### Iniciar o serviço
```bash
docker start service-monitor
```

### Ver logs das últimas 100 linhas
```bash
docker logs --tail 100 service-monitor
```

### Acessar terminal dentro do container
```bash
docker exec -it service-monitor sh
```
(Digite `exit` para sair)

### Remover container completamente
```bash
docker stop service-monitor
docker rm service-monitor
```

---

## 🔄 Atualizar a Aplicação (Quando fizer mudanças)

### Quando você fizer mudanças no código e fizer push no GitHub:

```bash
# 1. Conectar na EC2
ssh -i "C:\Users\michel.quaresma\Downloads\observium-01.pem" ubuntu@18.215.174.193

# 2. Ir para a pasta
cd ~/service-monitoring-system

# 3. Baixar atualizações
git pull

# 4. Rebuild da imagem
docker build -t service-monitor .

# 5. Parar container antigo
docker stop service-monitor
docker rm service-monitor

# 6. Iniciar novo container
docker run -d \
    --name service-monitor \
    --restart unless-stopped \
    -p 80:3000 \
    -v $(pwd)/prisma:/app/prisma \
    -e NODE_ENV=production \
    -e DATABASE_URL="file:./prisma/monitoring.db" \
    service-monitor

# 7. Verificar
docker logs -f service-monitor
```

---

## 🐛 Problemas Comuns e Soluções

### ❌ "Permission denied" ao executar comandos Docker
**Solução:**
```bash
sudo usermod -aG docker ubuntu
newgrp docker
# Ou adicione 'sudo' antes dos comandos docker
```

### ❌ Porta 80 já está em uso
**Solução:**
```bash
# Ver o que está usando a porta 80
sudo netstat -tulpn | grep :80

# Se for Apache, parar ele
sudo systemctl stop apache2
sudo systemctl disable apache2
```

### ❌ Container não inicia
**Solução:**
```bash
# Ver logs detalhados
docker logs service-monitor

# Tentar rodar em modo interativo para ver erro
docker run --rm -it -p 80:3000 service-monitor
```

### ❌ "Database error" nos logs
**Solução:**
```bash
docker exec -it service-monitor sh
cd prisma
npx prisma generate
npx prisma db push
exit
```

### ❌ Site não abre no navegador
**Verificar:**
1. Security Group tem porta 80 liberada? (Passo 1)
2. Container está rodando? `docker ps`
3. Logs mostram erros? `docker logs service-monitor`
4. Testou com curl? `curl http://localhost`

---

## ✅ Checklist Completo

Antes de considerar finalizado, verifique:

- [ ] Security Group configurado (portas 22 e 80 abertas)
- [ ] Consegui conectar via SSH
- [ ] Docker instalado e funcionando (`docker --version`)
- [ ] Repositório clonado (`ls ~/service-monitoring-system`)
- [ ] Arquivo .env criado (`cat ~/service-monitoring-system/.env`)
- [ ] Imagem Docker criada (`docker images | grep service-monitor`)
- [ ] Container rodando (`docker ps`)
- [ ] Logs sem erros críticos (`docker logs service-monitor`)
- [ ] Curl funciona (`curl http://localhost`)
- [ ] Navegador abre o site (`http://18.215.174.193`)

---

## 🎉 Pronto!

Seu Service Monitor está no ar em:
### 🌐 http://18.215.174.193

Agora você pode:
1. **Adicionar serviços** para monitorar
2. **Acessar de qualquer dispositivo** (mobile, tablet, desktop)
3. **Compartilhar o link** com sua equipe

---

## 📞 Ajuda Rápida

**Para desconectar do SSH:**
```bash
exit
```

**Para reconectar:**
```powershell
ssh -i "C:\Users\michel.quaresma\Downloads\observium-01.pem" ubuntu@18.215.174.193
```

**Para ver status rápido:**
```bash
docker ps && docker logs --tail 20 service-monitor
```

---

**Criado por:** GitHub Copilot  
**Data:** 02/01/2026  
**Versão:** 1.0 - Guia Manual Completo
