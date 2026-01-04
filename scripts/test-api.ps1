# Script para testar API em PowerShell (Windows)
# Executar: .\test-api.ps1

$BaseURL = "http://localhost:3000"
$ServiceID = ""

Write-Host "🧪 Service Monitor API Test Suite" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Method $Endpoint ... " -NoNewline
    
    try {
        $params = @{
            Uri = "$BaseURL$Endpoint"
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Data) {
            $params['Body'] = $Data
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $body = $response.Content
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✓ OK ($statusCode)" -ForegroundColor Green
            Write-Host $body | ConvertFrom-Json | ConvertTo-Json
        } else {
            Write-Host "✗ FAILED (expected $ExpectedStatus, got $statusCode)" -ForegroundColor Red
            Write-Host $body
        }
    } catch {
        Write-Host "✗ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# 1. Health Check
Write-Host "1️⃣  Health Check" -ForegroundColor Yellow
Test-Endpoint "GET" "/api/health" "" 200

# 2. List Services (should be empty initially)
Write-Host "2️⃣  List Services (empty)" -ForegroundColor Yellow
Test-Endpoint "GET" "/api/services" "" 200

# 3. Create Service
Write-Host "3️⃣  Create Service" -ForegroundColor Yellow
try {
    $createResponse = Invoke-WebRequest `
        -Uri "$BaseURL/api/services" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"name":"Google DNS","url":"https://8.8.8.8"}' `
        -ErrorAction Stop
    
    $serviceData = $createResponse.Content | ConvertFrom-Json
    $ServiceID = $serviceData.service.id
    
    Write-Host "Created service ID: $ServiceID" -ForegroundColor Green
    Write-Host ($serviceData | ConvertTo-Json)
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4. Get Service
if ($ServiceID) {
    Write-Host "4️⃣  Get Service" -ForegroundColor Yellow
    Test-Endpoint "GET" "/api/services/$ServiceID" "" 200

    # 5. Update Service
    Write-Host "5️⃣  Update Service" -ForegroundColor Yellow
    Test-Endpoint "PUT" "/api/services/$ServiceID" '{"name":"Updated Google DNS"}' 200

    # 6. Get Service History
    Write-Host "6️⃣  Get Service History" -ForegroundColor Yellow
    Test-Endpoint "GET" "/api/services/$ServiceID/history" "" 200

    # 7. Force Check
    Write-Host "7️⃣  Force Health Check" -ForegroundColor Yellow
    Test-Endpoint "POST" "/api/services/$ServiceID/check" "" 200
}

# 8. List Services (now with one service)
Write-Host "8️⃣  List Services (with service)" -ForegroundColor Yellow
Test-Endpoint "GET" "/api/services" "" 200

# 9. Create Another Service
Write-Host "9️⃣  Create Another Service" -ForegroundColor Yellow
try {
    $createResponse2 = Invoke-WebRequest `
        -Uri "$BaseURL/api/services" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"name":"GitHub","url":"https://github.com"}' `
        -ErrorAction Stop
    
    $serviceData2 = $createResponse2.Content | ConvertFrom-Json
    $ServiceID2 = $serviceData2.service.id
    
    Write-Host "Created service ID: $ServiceID2" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 10. List Services (now with two services)
Write-Host "🔟 List Services (with two services)" -ForegroundColor Yellow
Test-Endpoint "GET" "/api/services" "" 200

# 11. Delete Service
if ($ServiceID) {
    Write-Host "1️⃣1️⃣  Delete Service" -ForegroundColor Yellow
    Test-Endpoint "DELETE" "/api/services/$ServiceID" "" 200

    # 12. Get Deleted Service (should fail)
    Write-Host "1️⃣2️⃣  Get Deleted Service (should fail)" -ForegroundColor Yellow
    try {
        Test-Endpoint "GET" "/api/services/$ServiceID" "" 404
    } catch {
        # Expected to fail
    }
}

# 13. List Services (back to one)
Write-Host "1️⃣3️⃣  List Services (back to one)" -ForegroundColor Yellow
Test-Endpoint "GET" "/api/services" "" 200

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Test suite completed!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "  - Open browser at http://localhost:3000"
Write-Host "  - Check .data\ folder for persisted data"
Write-Host "  - Logs show in the terminal where pnpm dev runs"
