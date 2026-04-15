# Install the workshop-agents Cursor plugin via a directory junction into
# %USERPROFILE%\.cursor\plugins\local\. Junctions don't require admin or
# Developer Mode. Re-run with -Force to replace an existing install.

[CmdletBinding()]
param(
    [switch]$Force,
    [Alias('h')]
    [switch]$Help
)

if ($Help) {
    @"
Usage: .\install.ps1 [-Force]

Junctions the workshop-agents Cursor plugin into %USERPROFILE%\.cursor\plugins\local\.
After install, reload Cursor (Developer: Reload Window) to pick up the plugin.

Options:
  -Force   Replace an existing install at %USERPROFILE%\.cursor\plugins\local\workshop-agents.
  -Help    Show this help.
"@ | Write-Host
    exit 0
}

$ErrorActionPreference = 'Stop'

$PluginName = 'workshop-agents'
$PluginDir  = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$TargetDir  = Join-Path $env:USERPROFILE '.cursor\plugins\local'
$Target     = Join-Path $TargetDir $PluginName

New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null

if (Test-Path -LiteralPath $Target) {
    if (-not $Force) {
        Write-Error "Already installed at $Target. Re-run with -Force to replace it, or remove it manually: Remove-Item -LiteralPath '$Target' -Recurse -Force"
        exit 1
    }
    Remove-Item -LiteralPath $Target -Recurse -Force
}

# mklink /J creates a directory junction. No admin or Developer Mode required.
$mklinkArgs = "/c mklink /J `"$Target`" `"$PluginDir`""
$proc = Start-Process -FilePath 'cmd.exe' -ArgumentList $mklinkArgs -NoNewWindow -PassThru -Wait
if ($proc.ExitCode -ne 0) {
    Write-Error "mklink failed with exit code $($proc.ExitCode)."
    exit $proc.ExitCode
}

Write-Host @"
Installed workshop-agents at:
  $Target -> $PluginDir

Next:
  1. In Cursor, run 'Developer: Reload Window' (from the command palette).
  2. Try the new slash commands:
       /workshop-plan
       /workshop-work
       /workshop-review

To uninstall:
  Remove-Item -LiteralPath '$Target' -Recurse -Force
"@
