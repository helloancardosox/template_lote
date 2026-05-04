param(
  [switch]$Check,
  [switch]$SetAuthtoken,
  [string]$Authtoken
)

$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$configPath = Join-Path $projectRoot 'ngrok-local.yml'
$defaultConfigPaths = @(
  (Join-Path $env:LOCALAPPDATA 'ngrok\ngrok.yml'),
  (Join-Path $env:USERPROFILE '.ngrok2\ngrok.yml')
)

if (-not (Test-Path $configPath)) {
  throw "Arquivo ngrok-local.yml nao encontrado em: $projectRoot"
}

$wingetPackages = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'
$candidates = @()

if (Test-Path $wingetPackages) {
  $candidates += Get-ChildItem -Path $wingetPackages -Recurse -Filter ngrok.exe -ErrorAction SilentlyContinue |
    Where-Object { $_.Length -gt 0 } |
    Select-Object -ExpandProperty FullName
}

$pathCommand = Get-Command ngrok -ErrorAction SilentlyContinue
if ($pathCommand) {
  $candidates += $pathCommand.Source
}

$ngrok = $candidates |
  Where-Object { $_ -and (Test-Path $_) -and ((Get-Item $_).Length -gt 0) } |
  Select-Object -First 1

if (-not $ngrok) {
  throw "ngrok.exe nao encontrado. Instale com: winget install --id Ngrok.Ngrok -e"
}

Write-Host "Usando ngrok: $ngrok"
$existingConfigPaths = @(
  $defaultConfigPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
  $configPath
)
$configArgs = @()
foreach ($path in $existingConfigPaths) {
  $configArgs += @('--config', $path)
}

if ($Check) {
  & $ngrok version
  foreach ($path in $existingConfigPaths) {
    Write-Host "Config: $path"
  }
  & $ngrok config check @configArgs
  exit $LASTEXITCODE
}

if ($SetAuthtoken -or $Authtoken) {
  if (-not $Authtoken) {
    $Authtoken = Read-Host 'Cole seu authtoken do ngrok'
  }

  if ([string]::IsNullOrWhiteSpace($Authtoken)) {
    throw 'Authtoken vazio. Nada foi salvo.'
  }

  & $ngrok config add-authtoken $Authtoken
  exit $LASTEXITCODE
}

& $ngrok start app @configArgs
