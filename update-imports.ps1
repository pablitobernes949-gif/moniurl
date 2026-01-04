# Script para atualizar todos os imports automaticamente
$files = Get-ChildItem -Recurse -Include *.ts,*.tsx | Where-Object { 
    $_.FullName -notmatch 'node_modules' -and 
    $_.FullName -notmatch '\.next' 
}

$count = 0

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content
        $modified = $false
        
        # Substituir imports um por um
        $replacements = @{
            'from [''"]@/lib/types[''"]' = 'from "@/lib/utils/types"'
            'from [''"]@/lib/utils[''"]' = 'from "@/lib/utils/utils"'
            'from [''"]@/lib/alerts[''"]' = 'from "@/lib/monitoring/alerts"'
            'from [''"]@/lib/monitoring[''"]' = 'from "@/lib/monitoring/monitoring"'
            'from [''"]@/lib/realtime[''"]' = 'from "@/lib/monitoring/realtime"'
            'from [''"]@/lib/aws-realtime[''"]' = 'from "@/lib/monitoring/aws-realtime"'
            'from [''"]@/lib/storage[''"]' = 'from "@/lib/database/storage"'
            'from [''"]@/lib/db[''"]' = 'from "@/lib/database/db"'
            'from [''"]@/lib/db-operations[''"]' = 'from "@/lib/database/db-operations"'
            'from [''"]@/lib/init[''"]' = 'from "@/lib/initialization/init"'
            'from [''"]@/lib/seed[''"]' = 'from "@/lib/initialization/seed"'
            'from [''"]@/lib/worker[''"]' = 'from "@/lib/initialization/worker"'
        }
        
        foreach ($pattern in $replacements.Keys) {
            if ($content -match $pattern) {
                $content = $content -replace $pattern, $replacements[$pattern]
                $modified = $true
            }
        }
        
        if ($modified -and $content -ne $originalContent) {
            Set-Content $file.FullName -Value $content -NoNewline
            Write-Host "v $($file.Name)" -ForegroundColor Green
            $count++
        }
    }
    catch {
        Write-Host "x $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "IMPORTS ATUALIZADOS: $count arquivos" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximo passo: npm run build" -ForegroundColor Yellow
