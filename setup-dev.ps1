[CmdletBinding()]
param(
    [switch]$SkipPostgres
)

& (Join-Path $PSScriptRoot "scripts/setup-dev.ps1") @PSBoundParameters
