# Script de teste de conectividade entre VMs
# Execute na VM do Grafana para testar conexão com a VM do Sistema

param(
    [Parameter(Mandatory=$true)]
    [string]$VM1_IP,
    [int]$VM1_Port = 3000
)

$baseUrl = "http://${VM1_IP}:${VM1_Port}"

Write-Host "`n========================================" -ForegroundColor Blue
Write-Host "  TESTE DE CONECTIVIDADE ENTRE VMs" -ForegroundColor Blue
Write-Host "========================================`n" -ForegroundColor Blue

Write-Host "VM 1 (Sistema): $baseUrl`n" -ForegroundColor Cyan

$testsTotal = 0
$testsPassed = 0

function Test-VMEndpoint {
    param(
        [string]$Name,
        [string]$Endpoint,
        [string]$Method = "GET",
        [string]$Body = $null
    )
    
    $script:testsTotal++
    
    try {
        $url = "$baseUrl$Endpoint"
        $params = @{
            Uri = $url
            Method = $Method
            TimeoutSec = 10
            ErrorAction = 'Stop'
        }
        
        if ($Method -eq "POST") {
            $params.Headers = @{"Content-Type" = "application/json"}
            if (-not $Body) {
                $Body = @{
                    range = @{
                        from = (Get-Date).AddHours(-1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                        to = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                    }
                } | ConvertTo-Json
            }
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] $Name - Status: 200" -ForegroundColor Green
            $script:testsPassed++
            return $true
        } else {
            Write-Host "[ERRO] $Name - Status: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "[ERRO] $Name - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Teste de ping básico
Write-Host "Testando conectividade de rede..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName $VM1_IP -Count 2 -Quiet
    if ($ping) {
        Write-Host "[OK] Ping - VM acessível" -ForegroundColor Green
    } else {
        Write-Host "[ERRO] Ping - VM não responde" -ForegroundColor Red
        Write-Host "`nVerifique:" -ForegroundColor Yellow
        Write-Host "  - IP correto: $VM1_IP" -ForegroundColor Cyan
        Write-Host "  - Firewall da VM 1" -ForegroundColor Cyan
        Write-Host "  - Conectividade de rede" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "[AVISO] Não foi possível fazer ping (pode estar bloqueado)" -ForegroundColor Yellow
}

# Teste de porta TCP
Write-Host "`nTestando porta TCP $VM1_Port..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connect = $tcpClient.BeginConnect($VM1_IP, $VM1_Port, $null, $null)
    $wait = $connect.AsyncWaitHandle.WaitOne(3000, $false)
    
    if ($wait) {
        $tcpClient.EndConnect($connect)
        Write-Host "[OK] Porta $VM1_Port - Aberta e acessível" -ForegroundColor Green
        $tcpClient.Close()
    } else {
        Write-Host "[ERRO] Porta $VM1_Port - Timeout ou fechada" -ForegroundColor Red
        Write-Host "`nVerifique:" -ForegroundColor Yellow
        Write-Host "  - Sistema rodando na VM 1" -ForegroundColor Cyan
        Write-Host "  - Firewall liberado na porta $VM1_Port" -ForegroundColor Cyan
        $tcpClient.Close()
        exit 1
    }
} catch {
    Write-Host "[ERRO] Porta $VM1_Port - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nTestando endpoints da API..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────`n" -ForegroundColor Gray

# Executar testes de endpoints
Test-VMEndpoint -Name "Prometheus Metrics" -Endpoint "/api/grafana/prometheus" | Out-Null
Test-VMEndpoint -Name "Query Endpoint (GET)" -Endpoint "/api/grafana/query" | Out-Null
Test-VMEndpoint -Name "Query Endpoint (POST)" -Endpoint "/api/grafana/query" -Method "POST" | Out-Null
Test-VMEndpoint -Name "Search Endpoint" -Endpoint "/api/grafana/search" | Out-Null
Test-VMEndpoint -Name "Annotations Endpoint" -Endpoint "/api/grafana/annotations" -Method "POST" | Out-Null

# Teste específico do Prometheus para mostrar dados
Write-Host "`nTestando dados do Prometheus..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/grafana/prometheus" -TimeoutSec 10
    $content = $response.Content
    $metricsCount = ($content -split "`n" | Where-Object { $_ -and !$_.StartsWith("#") }).Count
    
    if ($metricsCount -gt 0) {
        Write-Host "[OK] Prometheus - $metricsCount métricas disponíveis" -ForegroundColor Green
        
        # Mostrar algumas métricas
        Write-Host "`nMétricas encontradas:" -ForegroundColor Cyan
        $metrics = $content -split "`n" | Where-Object { $_ -match "^service_" } | Select-Object -First 5
        foreach ($metric in $metrics) {
            $metricName = ($metric -split "{")[0]
            Write-Host "  - $metricName" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "[AVISO] Não foi possível obter métricas detalhadas" -ForegroundColor Yellow
}

# Resumo
Write-Host "`n========================================" -ForegroundColor Blue
Write-Host "            RESUMO" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue

$percentage = if ($testsTotal -gt 0) { [math]::Round(($testsPassed / $testsTotal) * 100, 1) } else { 0 }
$color = if ($percentage -eq 100) { "Green" } elseif ($percentage -ge 60) { "Yellow" } else { "Red" }

Write-Host "`nTotal de testes: $testsTotal" -ForegroundColor Cyan
Write-Host "Testes passados: $testsPassed" -ForegroundColor Green
Write-Host "Testes falhos: $($testsTotal - $testsPassed)" -ForegroundColor Red
Write-Host "Taxa de sucesso: $percentage%" -ForegroundColor $color

if ($testsPassed -eq $testsTotal -and $testsTotal -gt 0) {
    Write-Host "`n[OK] Todas as APIs estão acessíveis!" -ForegroundColor Green
    Write-Host "`nPróximos passos:" -ForegroundColor Cyan
    Write-Host "1. No Grafana, adicione Data Source Prometheus:" -ForegroundColor White
    Write-Host "   URL: $baseUrl/api/grafana/prometheus" -ForegroundColor Gray
    Write-Host "`n2. Adicione Data Source SimpleJSON:" -ForegroundColor White
    Write-Host "   URL: $baseUrl/api/grafana" -ForegroundColor Gray
    Write-Host "`n3. Importe o dashboard:" -ForegroundColor White
    Write-Host "   Arquivo: config\grafana-dashboard-complete.json" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "`n[AVISO] Alguns testes falharam!" -ForegroundColor Yellow
    Write-Host "`nVerifique:" -ForegroundColor Cyan
    Write-Host "  - Sistema rodando na VM 1: $baseUrl" -ForegroundColor White
    Write-Host "  - Firewall da VM 1 liberado na porta $VM1_Port" -ForegroundColor White
    Write-Host "  - Conectividade de rede entre as VMs" -ForegroundColor White
    Write-Host ""
}

# Informações adicionais
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host "Informações de configuração:" -ForegroundColor Cyan
Write-Host "VM 1 IP: $VM1_IP" -ForegroundColor White
Write-Host "VM 1 Porta: $VM1_Port" -ForegroundColor White
Write-Host "Base URL: $baseUrl" -ForegroundColor White
Write-Host ""
