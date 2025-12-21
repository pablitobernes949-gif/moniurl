# Deploy na AWS EC2 — Passo-a-Passo

Este guia explica como lançar a aplicação em uma instância EC2 (Linux) usando Docker.

## Pré-requisitos

- Conta AWS com acesso EC2
- chave SSH (.pem) salva localmente
- AWS CLI configurado (opcional, para pull do ECR)

---

## 1) Lançar instância EC2

### Via console AWS:
1. Vá em **EC2 > Instances > Launch instance**
2. **AMI**: Amazon Linux 2 ou Ubuntu 22.04 LTS (t3.small ou maior)
3. **Security Group**: crie ou selecione um com:
   - Inbound: SSH (22), HTTP (80), HTTPS (443) de seu IP ou 0.0.0.0/0
   - Outbound: permitir tudo (padrão)
4. **Storage**: 30 GB gp3 é suficiente
5. **Key pair**: crie ou selecione existente
6. **Public IP**: sim (ou use Elastic IP depois)
7. **Launch** e aguarde status "running"

### Via CLI:
```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.small \
  --key-name minha-chave \
  --security-groups default \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=service-monitor}]'
```

---

## 2) Conectar à instância via SSH

Obtenha o **IP Público** da instância no console EC2.

```bash
# download/permissão da chave (primeira vez)
chmod 600 /caminho/para/minha-chave.pem

# conectar
ssh -i /caminho/para/minha-chave.pem ec2-user@<PUBLIC_IP>
# ou se for Ubuntu:
# ssh -i /caminho/para/minha-chave.pem ubuntu@<PUBLIC_IP>
```

---

## 3) Instalar Docker na EC2

### Amazon Linux 2:
```bash
sudo yum update -y
sudo yum install docker git -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user
newgrp docker

# verificar
docker ps
```

### Ubuntu:
```bash
sudo apt update
sudo apt install -y docker.io git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ubuntu
newgrp docker

docker ps
```

---

## 4) Clonar repositório ou copiar código

### Opção A: Clonar do GitHub
```bash
cd /home/ec2-user  # ou /home/ubuntu
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo
```

### Opção B: Copiar arquivo .zip ou carregar via SCP
```bash
# Localmente (seu PC):
scp -i chave.pem -r ./service-monitoring-system ec2-user@<PUBLIC_IP>:/home/ec2-user/

# Na EC2:
cd ~/service-monitoring-system
```

---

## 5) Build e run da imagem Docker (opção simples)

### Opção A: Build localmente e rodar
```bash
# na EC2, dentro do diretório do projeto
docker build -t service-monitor .

# rodar em background
docker run -d \
  --name service-monitor \
  -p 80:3000 \
  -e NODE_ENV=production \
  -e AWS_REGION=us-east-1 \
  service-monitor

# verificar logs
docker logs -f service-monitor
```

### Opção B: Usar docker-compose (recomendado)
```bash
# na EC2, dentro do diretório do projeto
# (certifique-se que docker-compose.yml está presente)

docker-compose up -d

# verificar
docker-compose ps
docker-compose logs -f
```

---

## 6) Usar imagem do ECR (mais eficiente)

Se você fez push para ECR:

```bash
# na EC2, configurar AWS credentials (opcional)
aws configure
# ou definir via variáveis:
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=us-east-1

# login no ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# pull imagem
docker pull <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/service-monitor:latest

# rodar
docker run -d \
  --name service-monitor \
  -p 80:3000 \
  -e NODE_ENV=production \
  -e AWS_REGION=us-east-1 \
  -e AWS_DYNAMODB_TABLE=service-history \
  -e AWS_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789:service-monitor-events \
  <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/service-monitor:latest
```

---

## 7) Configurar variáveis de ambiente (.env)

Crie `.env` no diretório do projeto (ou passe via `-e` no `docker run`):

```bash
cat > .env << 'EOF'
NODE_ENV=production
AWS_REGION=us-east-1
AWS_DYNAMODB_TABLE=service-history
AWS_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789:service-monitor-events
EOF

# E ao rodar com docker-compose:
docker-compose up -d
```

Veja `.env.example` para referência completa.

---

## 8) Configurar domínio e HTTPS (opcional, recomendado)

### A) Apontar domínio para IP da EC2

1. No seu registrador (GoDaddy, Namecheap, Route53, etc), crie um registro A:
   - Type: A
   - Value: IP público da EC2

### B) Instalar Certbot para HTTPS (Let's Encrypt)

```bash
# Amazon Linux 2
sudo yum install certbot python3-certbot-nginx -y

# Ubuntu
sudo apt install certbot python3-certbot-nginx -y

# gerar certificado
sudo certbot certonly --standalone -d seu-dominio.com

# certificados estarão em: /etc/letsencrypt/live/seu-dominio.com/
```

### C) Usar nginx como reverse proxy (opcional)

Se quiser nginx na frente do container Docker:

```bash
# instalar nginx
sudo yum install nginx -y  # Amazon Linux
# ou
sudo apt install nginx -y   # Ubuntu

# editar config
sudo nano /etc/nginx/conf.d/service-monitor.conf
```

Adicione:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 9) Auto-restart do container (systemd)

Para garantir que o container reinicia ao rebootar EC2:

```bash
sudo nano /etc/systemd/system/service-monitor.service
```

Adicione:
```ini
[Unit]
Description=Service Monitor Docker Container
After=docker.service
Requires=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
User=ec2-user
ExecStart=/usr/bin/docker run -d \
  --name service-monitor \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e AWS_REGION=us-east-1 \
  service-monitor

ExecStop=/usr/bin/docker stop service-monitor
ExecStopPost=/usr/bin/docker rm service-monitor

[Install]
WantedBy=multi-user.target
```

Ative:
```bash
sudo systemctl daemon-reload
sudo systemctl enable service-monitor
sudo systemctl start service-monitor
sudo systemctl status service-monitor
```

---

## 10) Gerenciar container

```bash
# ver logs
docker logs -f service-monitor

# parar
docker stop service-monitor

# reiniciar
docker restart service-monitor

# remover
docker rm service-monitor

# entrar no container
docker exec -it service-monitor /bin/sh
```

---

## 11) DynamoDB + SNS (persistência e realtime)

### DynamoDB

```bash
# criar tabela (na EC2 ou localmente com AWS CLI)
aws dynamodb create-table \
  --table-name service-history \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# IAM: EC2 instance role precisa de permissões
# (ou configure AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY)
```

### SNS

```bash
# criar tópico
aws sns create-topic --name service-monitor-events --region us-east-1
# guarde o ARN retornado
```

Defina as env vars na EC2 apontando para esses recursos.

---

## 12) Health check e monitoramento

Acesse a aplicação:
```bash
curl http://<PUBLIC_IP>:3000
```

ou abra no navegador: `http://<PUBLIC_IP>:3000`

Para testar a API:
```bash
curl http://<PUBLIC_IP>:3000/api/services/1/history
```

---

## 13) Troubleshooting

**Porta 80 não funciona?**
- Verifique Security Group: porta 80 deve estar aberta
- Verifique se nginx/outro serviço já usa porta 80

**Container falha ao iniciar?**
```bash
docker logs service-monitor
docker inspect service-monitor
```

**DynamoDB/SNS falha?**
- EC2 precisa ter role IAM com permissões, ou
- Defina `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` no container

**EC2 fica sem memória?**
- Aumente tipo (t3.medium/large)
- Limite memória do container: `docker run ... --memory 512m`

---

## Resumo rápido (começar do zero)

```bash
# 1) Conectar à EC2
ssh -i chave.pem ec2-user@<PUBLIC_IP>

# 2) Instalar Docker
sudo yum update -y && sudo yum install docker -y
sudo systemctl start docker
sudo usermod -a -G docker ec2-user

# 3) Clonar/copiar código
git clone ... ou copiar arquivos

# 4) Build e run
cd service-monitoring-system
docker build -t service-monitor .
docker run -d -p 80:3000 -e NODE_ENV=production service-monitor

# 5) Acessar
curl http://<PUBLIC_IP>
```

---

**Próximos passos:**
- Usar docker-compose para simplificar variáveis de ambiente
- Configurar HTTPS com Let's Encrypt
- Configurar IAM role para EC2 acessar DynamoDB/SNS sem credenciais duras
- Implementar forwarder Lambda para SNS → WebSocket (realtime multi-instância)
