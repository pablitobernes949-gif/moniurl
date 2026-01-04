# Script de teste para integração com Grafana (Windows)
# Executa: .\test-grafana.ps1

$baseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:3000" }

Write-Host "`n========================================" -ForegroundColor Blue
Write-Host "   TESTE DE INTEGRAÇÃO COM GRAFANA" -ForegroundColor Blue
Write-Host "========================================`n" -ForegroundColor Blue

Write-Host "Base URL: $baseUrl`n" -ForegroundColor Cyan

$totalTests = 0
$passedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null
    )
    
    $script:totalTests++
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        $params = @{
            Uri = "$baseUrl$Url"
            Method = $Method
            Headers = $headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        
        Write-Host "[OK] $Name" -ForegroundColor Green
        Write-Host "     Status: $($response.StatusCode)" -ForegroundColor Cyan
        
        $script:passedTests++
        return $response
    }
    catch {
        Write-Host "[ERRO] $Name" -ForegroundColor Red
        Write-Host "       $($_.Exception.Message)" -ForegroundColor Yellow
        return $null
    }
}

# =========================================
# TESTE 1: Prometheus Metrics
# =========================================
Write-Host "`nTestando Prometheus Metrics..." -ForegroundColor Yellow
$prometheusResponse = Test-Endpoint -Name "Prometheus Metrics" -Url "/api/grafana/prometheus"

if ($prometheusResponse) {
    $content = $prometheusResponse.Content
    $metricsCount = ($content -split "`n" | Where-Object { $_ -and !$_.StartsWith("#") }).Count
    Write-Host "     Métricas encontradas: $metricsCount" -ForegroundColor Cyan
    
    # Verificar métricas esperadas
    $expectedMetrics = @(
        "service_up",
        "service_latency_milliseconds",
        "service_uptime_percentage",
        "service_alerts_active"
    )
    
    foreach ($metric in $expectedMetrics) {
        if ($content -match $metric) {
            Write-Host "     [OK] $metric" -ForegroundColor Green
        } else {
            Write-Host "     [AVISO] $metric não encontrado" -ForegroundColor Yellow
        }
    }
}

# =========================================
# TESTE 2: Query Endpoint (GET)
# =========================================
Write-Host "`nTestando Query Endpoint (GET)..." -ForegroundColor Yellow
Test-Endpoint -Name "Query GET" -Url "/api/grafana/query" | Out-Null

# =========================================
# TESTE 3: Query Endpoint (POST)
# =========================================
Write-Host "`nTestando Query Endpoint (POST)..." -ForegroundColor Yellow
$queryBody = @{
    targets = @(
        @{ target = "latency" }
    )
    range = @{
        from = (Get-Date).AddDays(-1).ToString("o")
        to = (Get-Date).ToString("o")
    }
} | ConvertTo-Json -Depth 10

$queryResponse = Test-Endpoint -Name "Query POST" -Url "/api/grafana/query" -Method "POST" -Body $queryBody

if ($queryResponse) {
    $data = $queryResponse.Content | ConvertFrom-Json
    Write-Host "     Séries retornadas: $($data.Count)" -ForegroundColor Cyan
}

# =========================================
# TESTE 4: Search Endpoint (GET)
# =========================================
Write-Host "`nTestando Search Endpoint (GET)..." -ForegroundColor Yellow
$searchResponse = Test-Endpoint -Name "Search GET" -Url "/api/grafana/search"

if ($searchResponse) {
    $data = $searchResponse.Content | ConvertFrom-Json
    Write-Host "     Métricas disponíveis: $($data.metrics.Count)" -ForegroundColor Cyan
    Write-Host "     Serviços disponíveis: $($data.services.Count)" -ForegroundColor Cyan
}

# =========================================
# TESTE 5: Search Endpoint (POST)
# =========================================
Write-Host "`nTestando Search Endpoint (POST)..." -ForegroundColor Yellow
$searchBody = @{ target = "" } | ConvertTo-Json
$searchPostResponse = Test-Endpoint -Name "Search POST" -Url "/api/grafana/search" -Method "POST" -Body $searchBody

if ($searchPostResponse) {
    $data = $searchPostResponse.Content | ConvertFrom-Json
    Write-Host "     Resultados: $($data.Count)" -ForegroundColor Cyan
}

# =========================================
# TESTE 6: Annotations Endpoint (GET)
# =========================================
Write-Host "`nTestando Annotations Endpoint (GET)..." -ForegroundColor Yellow
Test-Endpoint -Name "Annotations GET" -Url "/api/grafana/annotations" | Out-Null

# =========================================
# TESTE 7: Annotations Endpoint (POST)
# =========================================
Write-Host "`nTestando Annotations Endpoint (POST)..." -ForegroundColor Yellow
$annotationsBody = @{
    range = @{
        from = (Get-Date).AddDays(-1).ToString("o")
        to = (Get-Date).ToString("o")
    }
    annotation = @{ name = "Alerts" }
} | ConvertTo-Json -Depth 10

$annotationsResponse = Test-Endpoint -Name "Annotations POST" -Url "/api/grafana/annotations" -Method "POST" -Body $annotationsBody

if ($annotationsResponse) {
    $data = $annotationsResponse.Content | ConvertFrom-Json
    Write-Host "     Anotações encontradas: $($data.Count)" -ForegroundColor Cyan
}

# =========================================
# TESTE 8: CORS Headers
# =========================================
Write-Host "`nTestando CORS Headers..." -ForegroundColor Yellow
Test-Endpoint -Name "CORS Options" -Url "/api/grafana/query" -Method "OPTIONS" | Out-Null

# =========================================
# RESUMO
# =========================================
Write-Host "`n========================================" -ForegroundColor Blue
Write-Host "            RESUMO DOS TESTES" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue

$percentage = [math]::Round(($passedTests / $totalTests) * 100, 1)
$color = if ($percentage -eq 100) { "Green" } elseif ($percentage -ge 70) { "Yellow" } else { "Red" }

Write-Host "`nTotal de testes: $totalTests" -ForegroundColor Cyan
Write-Host "Testes passados: $passedTests" -ForegroundColor Green
Write-Host "Testes falhos: $($totalTests - $passedTests)" -ForegroundColor Red
Write-Host "Taxa de sucesso: $percentage%" -ForegroundColor $color

if ($passedTests -eq $totalTests) {
    Write-Host "`n[OK] Todos os testes passaram! Integração com Grafana está funcionando!" -ForegroundColor Green
} else {
    Write-Host "`n[AVISO] Alguns testes falharam. Verifique a configuração." -ForegroundColor Yellow
}

Write-Host "`nPróximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure os data sources no Grafana" -ForegroundColor Cyan
Write-Host "2. Importe o dashboard: config\grafana-dashboard-complete.json" -ForegroundColor Cyan
Write-Host "3. Acesse: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
