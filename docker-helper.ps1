# Script auxiliar para gerenciar Docker no projeto Atlas
# Uso: .\docker-helper.ps1 <comando>

param(
    [Parameter(Mandatory=$false)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "  Atlas Docker Helper" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Comandos disponíveis:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  dev          - Inicia o ambiente de desenvolvimento" -ForegroundColor Green
    Write-Host "  prod         - Inicia o ambiente de produção" -ForegroundColor Green
    Write-Host "  stop         - Para todos os containers" -ForegroundColor Green
    Write-Host "  logs         - Exibe logs do container de desenvolvimento" -ForegroundColor Green
    Write-Host "  clean        - Limpa containers, volumes e imagens" -ForegroundColor Green
    Write-Host "  rebuild      - Reconstrói as imagens sem cache" -ForegroundColor Green
    Write-Host "  setup        - Configura o ambiente pela primeira vez" -ForegroundColor Green
    Write-Host "  help         - Exibe esta ajuda" -ForegroundColor Green
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor Yellow
    Write-Host "  .\docker-helper.ps1 dev" -ForegroundColor Gray
    Write-Host "  .\docker-helper.ps1 logs" -ForegroundColor Gray
    Write-Host ""
}

function Start-Dev {
    Write-Host "🚀 Iniciando ambiente de desenvolvimento..." -ForegroundColor Green
    docker-compose up dev
}

function Start-Prod {
    Write-Host "🚀 Iniciando ambiente de produção..." -ForegroundColor Green
    docker-compose up --build prod
}

function Stop-All {
    Write-Host "⏹️  Parando todos os containers..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "✅ Containers parados!" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "📋 Exibindo logs..." -ForegroundColor Cyan
    docker-compose logs -f dev
}

function Clean-All {
    Write-Host "🧹 Limpando recursos do Docker..." -ForegroundColor Yellow
    Write-Host "Isto irá remover containers, volumes e imagens. Deseja continuar? (S/N)" -ForegroundColor Red
    $confirm = Read-Host
    if ($confirm -eq "S" -or $confirm -eq "s") {
        docker-compose down -v --rmi all
        Write-Host "✅ Recursos limpos!" -ForegroundColor Green
    } else {
        Write-Host "❌ Operação cancelada." -ForegroundColor Yellow
    }
}

function Rebuild-All {
    Write-Host "🔨 Reconstruindo imagens sem cache..." -ForegroundColor Yellow
    docker-compose build --no-cache
    Write-Host "✅ Imagens reconstruídas!" -ForegroundColor Green
}

function Setup-Environment {
    Write-Host "⚙️  Configurando ambiente..." -ForegroundColor Cyan
    
    # Verificar se Docker está instalado
    try {
        docker --version | Out-Null
        Write-Host "✅ Docker instalado" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker não encontrado. Instale o Docker Desktop primeiro." -ForegroundColor Red
        return
    }
    
    # Verificar se .env existe
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  Arquivo .env não encontrado." -ForegroundColor Yellow
        
        if (Test-Path ".env.backup") {
            Write-Host "📋 Backup encontrado! Deseja restaurar? (S/N)" -ForegroundColor Cyan
            $restore = Read-Host
            if ($restore -eq "S" -or $restore -eq "s") {
                Copy-Item ".env.backup" ".env"
                Write-Host "✅ .env restaurado do backup!" -ForegroundColor Green
            } else {
                Write-Host "📝 Copie o .env.example e preencha suas credenciais:" -ForegroundColor Yellow
                Write-Host "   cp .env.example .env" -ForegroundColor Gray
            }
        } else {
            Write-Host "📝 Copie o .env.example e preencha suas credenciais:" -ForegroundColor Yellow
            Write-Host "   cp .env.example .env" -ForegroundColor Gray
        }
    } else {
        Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "✨ Configuração concluída!" -ForegroundColor Green
    Write-Host "Execute: .\docker-helper.ps1 dev" -ForegroundColor Cyan
}

# Router de comandos
switch ($Command.ToLower()) {
    "dev" { Start-Dev }
    "prod" { Start-Prod }
    "stop" { Stop-All }
    "logs" { Show-Logs }
    "clean" { Clean-All }
    "rebuild" { Rebuild-All }
    "setup" { Setup-Environment }
    "help" { Show-Help }
    default {
        Write-Host "❌ Comando desconhecido: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
