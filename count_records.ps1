$content = Get-Content 'C:\opencode0804\index.html' -Raw
$pattern = '"time":'
$matches = [regex]::Matches($content, $pattern)
Write-Host "Found $($matches.Count) records in INITIAL_RECORDS"
