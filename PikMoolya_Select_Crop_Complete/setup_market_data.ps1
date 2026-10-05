$ErrorActionPreference = "Stop"

$dbName = "pikmoolya"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

Write-Host "Applying Maharashtra market-price schema..."
& $psql -U postgres -d $dbName -f "$PSScriptRoot\database\market_prices_agmarknet_upgrade.sql"

if ($LASTEXITCODE -ne 0) {
    throw "Database schema update failed."
}

Write-Host "Database schema updated."
Write-Host "Now add DATA_GOV_API_KEY to:"
Write-Host "C:\Users\asus\OneDrive\Desktop\PikMoolya\apps\api\.env"
