$lines = Get-Content c:/Users/7e23r/Documents/GitHub/spectra/src/stores/gameStore.ts
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($i -ge 250 -and $i -le 262) {
        Write-Host "$($i+1): $line"
    }
}
