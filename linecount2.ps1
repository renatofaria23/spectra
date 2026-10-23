$lines = Get-Content c:/Users/7e23r/Documents/GitHub/spectra/src/stores/gameStore.ts
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($i -ge 245 -and $i -le 270) {
        Write-Host "$($i+1): $line"
    }
}
