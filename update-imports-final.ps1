Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ATUALIZANDO IMPORTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$updated = 0
$failed = 0

# Mapa de substituições
$replacements = @{
    '@/lib/types' = '@/lib/utils/types'
    '@/lib/utils"' = '@/lib/utils/utils"'
    "@/lib/utils'" = "@/lib/utils/utils'"
    '@/lib/alerts' = '@/lib/monitoring/alerts'
    '@/lib/monitoring"' = '@/lib/monitoring/monitoring"'
    "@/lib/monitoring'" = "@/lib/monitoring/monitoring'"
    '@/lib/realtime' = '@/lib/monitoring/realtime'
    '@/lib/aws-realtime' = '@/lib/monitoring/aws-realtime'
    '@/lib/storage' = '@/lib/database/storage'
    '@/lib/db"' = '@/lib/database/db"'
    "@/lib/db'" = "@/lib/database/db'"
    '@/lib/db-operations' = '@/lib/database/db-operations'
    '@/lib/init' = '@/lib/initialization/init'
    '@/lib/seed' = '@/lib/initialization/seed'
    '@/lib/worker' = '@/lib/initialization/worker'
    '@/components/add-service-dialog' = '@/components/modals/add-service-dialog'
    '@/components/service-details-modal' = '@/components/modals/service-details-modal'
    '@/components/alert-history-dialog' = '@/components/modals/alert-history-dialog'
    '@/components/comparison-chart-modal' = '@/components/modals/comparison-chart-modal'
    '@/components/service-settings-dialog' = '@/components/modals/service-settings-dialog'
    '@/components/webhook-settings-dialog' = '@/components/modals/webhook-settings-dialog'
    '@/components/reports-settings-dialog' = '@/components/modals/reports-settings-dialog'
    '@/components/alerts-panel' = '@/components/panels/alerts-panel'
    '@/components/trends-dashboard' = '@/components/panels/trends-dashboard'
    '@/components/incident-history' = '@/components/panels/incident-history'
    '@/components/service-card' = '@/components/cards/service-card'
    '@/components/service-stats' = '@/components/cards/service-stats'
    '@/components/sla-metrics' = '@/components/cards/sla-metrics'
    '@/components/service-chart' = '@/components/charts/service-chart'
    '@/components/service-details-chart' = '@/components/charts/service-details-chart'
    '@/components/theme-provider"' = '@/components/providers/theme-provider"'
    "@/components/theme-provider'" = "@/components/providers/theme-provider'"
    '@/components/theme-provider-enhanced' = '@/components/providers/theme-provider-enhanced'
}

# Atualizar imports com paths relativos em lib/
Write-Host "[1/3] Atualizando imports relativos em lib/..." -ForegroundColor Yellow

$libFiles = @(
    'lib\initialization\worker.ts',
    'lib\initialization\seed.ts',
    'lib\monitoring\alerts.ts',
    'lib\monitoring\monitoring.ts',
    'lib\monitoring\realtime.ts',
    'lib\monitoring\aws-realtime.ts',
    'lib\database\storage.ts'
)

foreach ($file in $libFiles) {
    if (Test-Path $file) {
        try {
            $content = Get-Content $file -Raw -Encoding UTF8
            $original = $content
            
            # Substituições específicas para paths relativos
            $content = $content -replace 'from ["\x27]\.\/types["\x27]', 'from "../utils/types"'
            $content = $content -replace 'from ["\x27]\.\/utils["\x27]', 'from "../utils/utils"'
            $content = $content -replace 'from ["\x27]\.\/storage["\x27]', 'from "../database/storage"'
            $content = $content -replace 'from ["\x27]\.\/db["\x27]', 'from "../database/db"'
            $content = $content -replace 'from ["\x27]\.\/db-operations["\x27]', 'from "../database/db-operations"'
            $content = $content -replace 'from ["\x27]\.\/monitoring["\x27]', 'from "../monitoring/monitoring"'
            $content = $content -replace 'from ["\x27]\.\/alerts["\x27]', 'from "../monitoring/alerts"'
            
            if ($content -ne $original) {
                [System.IO.File]::WriteAllText($file, $content, [System.Text.UTF8Encoding]::new($false))
                Write-Host "   OK $file" -ForegroundColor Green
                $updated++
            }
        }
        catch {
            Write-Host "   ERRO $file - $_" -ForegroundColor Red
            $failed++
        }
    }
}

# Atualizar todos os outros arquivos TypeScript
Write-Host "[2/3] Atualizando imports em arquivos do projeto..." -ForegroundColor Yellow

$files = Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse | Where-Object { 
    $_.FullName -notmatch 'node_modules' -and 
    $_.FullName -notmatch '\.next' -and
    $_.FullName -notmatch 'lib\\(database|monitoring|utils|initialization)\\' 
}

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $original = $content
        
        foreach ($old in $replacements.Keys) {
            $new = $replacements[$old]
            $content = $content -replace [regex]::Escape($old), $new
        }
        
        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
            Write-Host "   OK $($file.Name)" -ForegroundColor Green
            $updated++
        }
    }
    catch {
        Write-Host "   ERRO $($file.Name) - $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Atualizados: $updated" -ForegroundColor Green
Write-Host "Falhas: $failed" -ForegroundColor Red
Write-Host ""
Write-Host "Proximo passo: Execute 'npm run build' para testar" -ForegroundColor Yellow
Write-Host ""
