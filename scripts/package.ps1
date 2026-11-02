# Builds the submission artifacts into ./submission:
#   lakshitha-month4-app.zip         project source (no node_modules / build output)
#   lakshitha-month4-storybook.zip   static Storybook build
#   lakshitha-month4-lighthouse.pdf  copied from docs/lighthouse (run `npm run lighthouse` first)
#   lakshitha-month4-accessibility.md, lakshitha-month4-architecture.md
param([string]$Name = 'lakshitha')

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$out = Join-Path $root 'submission'
New-Item -ItemType Directory -Force $out | Out-Null

Write-Host 'Building Storybook...'
npm run build-storybook --silent
if ($LASTEXITCODE -ne 0) { throw 'Storybook build failed' }

# App source: copy to a staging folder without heavy/generated directories, then zip.
$stage = Join-Path ([IO.Path]::GetTempPath()) "$Name-month4-app"
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
$exclude = @('node_modules', 'dist', 'storybook-static', 'submission', '.git')
Get-ChildItem -Force $root | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
  Copy-Item -Recurse -Force $_.FullName (Join-Path $stage $_.Name)
}

$appZip = Join-Path $out "$Name-month4-app.zip"
$sbZip = Join-Path $out "$Name-month4-storybook.zip"
Remove-Item -Force -ErrorAction SilentlyContinue $appZip, $sbZip
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $appZip
Compress-Archive -Path (Join-Path $root 'storybook-static\*') -DestinationPath $sbZip
Remove-Item -Recurse -Force $stage

Copy-Item -Force "docs\$Name-month4-accessibility.md" $out
Copy-Item -Force "docs\$Name-month4-architecture.md" $out
$pdf = "docs\lighthouse\$Name-month4-lighthouse.pdf"
if (Test-Path $pdf) { Copy-Item -Force $pdf $out } else { Write-Warning "No Lighthouse PDF yet. Run: npm run build; npm run lighthouse" }

Write-Host "`nSubmission files:"
Get-ChildItem $out | Format-Table Name, @{ n = 'Size (KB)'; e = { [math]::Round($_.Length / 1KB) } } -AutoSize
