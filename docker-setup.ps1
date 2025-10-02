# Script de Configuração Automática do Docker
# Este script ajuda a configurar as variáveis de ambiente para o Docker

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "setup"
)

function Show-Banner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                   ║" -ForegroundColor Cyan
    Write-Host "║      🐳 Docker Environment Setup - Atlas         ║" -ForegroundColor Cyan
    Write-Host "║                                                   ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Test-EnvFile {
    param([string]$FilePath)
    return Test-Path $FilePath
}

function Copy-FromExisting {
    Write-Host "🔍 Procurando arquivos de configuração existentes..." -ForegroundColor Yellow
    Write-Host ""
    
    $envFiles = @(
        @{ Name = ".env"; Description = "Desenvolvimento local (atual)" },
        @{ Name = ".env.backup"; Description = "Backup de segurança" },
        @{ Name = ".env.docker"; Description = "Template Docker" }
    )
    
    $foundFiles = @()
    $index = 1
    
    foreach ($file in $envFiles) {
        if (Test-Path $file.Name) {
            $foundFiles += @{ Index = $index; Name = $file.Name; Description = $file.Description }
            Write-Host "  [$index] $($file.Name) - $($file.Description)" -ForegroundColor Green
            $index++
        }
    }
    
    if ($foundFiles.Count -eq 0) {
        Write-Host "❌ Nenhum arquivo de configuração encontrado!" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
    Write-Host "Selecione o arquivo para copiar (ou 0 para configurar manualmente): " -ForegroundColor Cyan -NoNewline
    $choice = Read-Host
    
    if ($choice -eq "0") {
        return $false
    }
    
    $choiceNum = [int]$choice
    $selectedFile = $foundFiles | Where-Object { $_.Index -eq $choiceNum }
    
    if ($selectedFile) {
        Write-Host ""
        Write-Host "📋 Copiando $($selectedFile.Name) para .env.docker.local..." -ForegroundColor Yellow
        Copy-Item $selectedFile.Name ".env.docker.local"
        Write-Host "✅ Arquivo copiado com sucesso!" -ForegroundColor Green
        return $true
    }
    
    return $false
}

function Setup-Environment {
    Show-Banner
    
    Write-Host "Este script vai configurar as variáveis de ambiente para o Docker." -ForegroundColor White
    Write-Host ""
    
    # Verificar se já existe .env.docker.local
    if (Test-Path ".env.docker.local") {
        Write-Host "⚠️  O arquivo .env.docker.local já existe!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Opções:" -ForegroundColor Cyan
        Write-Host "  [1] Manter o arquivo existente"
        Write-Host "  [2] Sobrescrever com novo arquivo"
        Write-Host "  [3] Fazer backup e criar novo"
        Write-Host ""
        $option = Read-Host "Escolha uma opção (1-3)"
        
        switch ($option) {
            "1" {
                Write-Host "✅ Mantendo arquivo existente." -ForegroundColor Green
                return
            }
            "2" {
                Write-Host "⚠️  Sobrescrevendo arquivo..." -ForegroundColor Yellow
                Remove-Item ".env.docker.local" -Force
            }
            "3" {
                $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
                $backupName = ".env.docker.local.backup_$timestamp"
                Write-Host "📦 Criando backup: $backupName" -ForegroundColor Yellow
                Copy-Item ".env.docker.local" $backupName
                Write-Host "✅ Backup criado!" -ForegroundColor Green
            }
        }
    }
    
    Write-Host ""
    Write-Host "Como deseja configurar as variáveis?" -ForegroundColor Cyan
    Write-Host "  [1] Copiar de um arquivo existente (.env, .env.backup)" -ForegroundColor White
    Write-Host "  [2] Usar template e editar manualmente" -ForegroundColor White
    Write-Host ""
    $configOption = Read-Host "Escolha uma opção (1-2)"
    
    if ($configOption -eq "1") {
        if (Copy-FromExisting) {
            Write-Host ""
            Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Próximos passos:" -ForegroundColor Yellow
            Write-Host "  1. Revise o arquivo .env.docker.local (se necessário)"
            Write-Host "  2. Execute: docker-compose up -d prod" -ForegroundColor Cyan
            Write-Host ""
            return
        }
    }
    
    # Opção 2 ou fallback
    Write-Host ""
    Write-Host "📝 Criando arquivo a partir do template..." -ForegroundColor Yellow
    
    if (Test-Path ".env.docker") {
        Copy-Item ".env.docker" ".env.docker.local"
        Write-Host "✅ Template copiado para .env.docker.local" -ForegroundColor Green
    } else {
        Write-Host "❌ Template .env.docker não encontrado!" -ForegroundColor Red
        return
    }
    
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Edite o arquivo .env.docker.local com suas credenciais reais!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Deseja abrir o arquivo agora? (S/N): " -ForegroundColor Cyan -NoNewline
    $openFile = Read-Host
    
    if ($openFile -eq "S" -or $openFile -eq "s") {
        notepad ".env.docker.local"
    }
    
    Write-Host ""
    Write-Host "✨ Setup concluído!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Após preencher as credenciais:" -ForegroundColor Yellow
    Write-Host "  docker-compose up -d prod" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Status {
    Show-Banner
    
    Write-Host "📊 Status dos arquivos de configuração:" -ForegroundColor Cyan
    Write-Host ""
    
    $files = @(
        @{ Name = ".env"; Description = "Desenvolvimento local"; Required = "Sim" },
        @{ Name = ".env.backup"; Description = "Backup de segurança"; Required = "Não" },
        @{ Name = ".env.docker"; Description = "Template Docker"; Required = "Sim" },
        @{ Name = ".env.docker.local"; Description = "Configuração Docker (produção)"; Required = "Sim" }
    )
    
    foreach ($file in $files) {
        $exists = Test-Path $file.Name
        $status = if ($exists) { "✅ Existe" } else { "❌ Não existe" }
        $color = if ($exists) { "Green" } else { "Red" }
        
        Write-Host ("  {0,-25} {1,-30} {2}" -f $file.Name, $file.Description, $status) -ForegroundColor $color
    }
    
    Write-Host ""
    
    # Verificar se o Docker está configurado corretamente
    if ((Test-Path ".env.docker.local")) {
        Write-Host "🐳 Docker: " -NoNewline -ForegroundColor Cyan
        Write-Host "Pronto para usar!" -ForegroundColor Green
        Write-Host "   Execute: docker-compose up -d prod" -ForegroundColor Gray
    } else {
        Write-Host "🐳 Docker: " -NoNewline -ForegroundColor Cyan
        Write-Host "Requer configuração" -ForegroundColor Yellow
        Write-Host "   Execute: .\docker-setup.ps1 setup" -ForegroundColor Gray
    }
    
    Write-Host ""
}

function Show-Help {
    Show-Banner
    
    Write-Host "Uso: .\docker-setup.ps1 [comando]" -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos disponíveis:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  setup      - Configurar variáveis de ambiente para Docker" -ForegroundColor Green
    Write-Host "  status     - Ver status dos arquivos de configuração" -ForegroundColor Green
    Write-Host "  help       - Mostrar esta ajuda" -ForegroundColor Green
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor Yellow
    Write-Host "  .\docker-setup.ps1 setup" -ForegroundColor Gray
    Write-Host "  .\docker-setup.ps1 status" -ForegroundColor Gray
    Write-Host ""
}

# Router de comandos
switch ($Action.ToLower()) {
    "setup" { Setup-Environment }
    "status" { Show-Status }
    "help" { Show-Help }
    default {
        Write-Host "❌ Comando desconhecido: $Action" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
