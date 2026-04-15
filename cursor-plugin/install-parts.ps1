# Workshop fallback installer (Windows).
#
# Installs the plugin's skills / agents / rule individually into Cursor's
# canonical user-scoped scan paths (%USERPROFILE%\.cursor\skills, ...\agents,
# ...\rules) by linking each one out of this plugin folder.
#
# Skills are folders -> directory junctions (mklink /J), no admin required.
# Agents and rules are files -> hard links (mklink /H), no admin required.
#
# Use this when the proper plugin install (./install.ps1) doesn't load in
# your Cursor build. Re-run with -Force to replace existing entries.

[CmdletBinding()]
param(
    [switch]$Force,
    [Alias('h')]
    [switch]$Help
)

if ($Help) {
    @"
Usage: .\install-parts.ps1 [-Force]

Installs each workshop-agents skill, agent, and rule into Cursor's canonical
scan paths:

  %USERPROFILE%\.cursor\skills\<skill-name>\    <- junction per skill folder
  %USERPROFILE%\.cursor\agents\<agent-name>.md  <- hard link per agent file
  %USERPROFILE%\.cursor\rules\<rule-name>.mdc   <- hard link per rule file

Use this when the proper plugin install (.\install.ps1) doesn't load in your
Cursor build.

Options:
  -Force   Replace existing entries at the destination paths.
  -Help    Show this help.
"@ | Write-Host
    exit 0
}

$ErrorActionPreference = 'Stop'

$PluginDir = (Resolve-Path -LiteralPath $PSScriptRoot).Path

$SkillsSrc = Join-Path $PluginDir 'skills'
$AgentsSrc = Join-Path $PluginDir 'agents'
$RulesSrc  = Join-Path $PluginDir 'rules'

$SkillsDst = Join-Path $env:USERPROFILE '.cursor\skills'
$AgentsDst = Join-Path $env:USERPROFILE '.cursor\agents'
$RulesDst  = Join-Path $env:USERPROFILE '.cursor\rules'

New-Item -ItemType Directory -Path $SkillsDst -Force | Out-Null
New-Item -ItemType Directory -Path $AgentsDst -Force | Out-Null
New-Item -ItemType Directory -Path $RulesDst  -Force | Out-Null

$installed = @{ Skills = @(); Agents = @(); Rules = @() }
$skipped   = @()

function Link-One {
    param(
        [string]$Source,
        [string]$Destination,
        [ValidateSet('Junction', 'HardLink')]
        [string]$Kind,
        [string]$Label
    )
    if (Test-Path -LiteralPath $Destination) {
        if (-not $Force) {
            $script:skipped += $Label
            return $false
        }
        Remove-Item -LiteralPath $Destination -Recurse -Force
    }
    if ($Kind -eq 'Junction') {
        $args = "/c mklink /J `"$Destination`" `"$Source`""
    } else {
        $args = "/c mklink /H `"$Destination`" `"$Source`""
    }
    $proc = Start-Process -FilePath 'cmd.exe' -ArgumentList $args -NoNewWindow -PassThru -Wait
    if ($proc.ExitCode -ne 0) {
        Write-Error "mklink failed for $Label (exit $($proc.ExitCode))"
        return $false
    }
    return $true
}

# Skills (folders -> junctions)
Get-ChildItem -LiteralPath $SkillsSrc -Directory | ForEach-Object {
    $name = $_.Name
    $dst = Join-Path $SkillsDst $name
    if (Link-One -Source $_.FullName -Destination $dst -Kind Junction -Label "skill: $name") {
        $installed.Skills += $name
    }
}

# Agents (files -> hard links)
Get-ChildItem -LiteralPath $AgentsSrc -Filter '*.md' -File | ForEach-Object {
    $name = $_.Name
    $dst = Join-Path $AgentsDst $name
    if (Link-One -Source $_.FullName -Destination $dst -Kind HardLink -Label "agent: $name") {
        $installed.Agents += $name
    }
}

# Rules (files -> hard links)
Get-ChildItem -LiteralPath $RulesSrc -Filter '*.mdc' -File | ForEach-Object {
    $name = $_.Name
    $dst = Join-Path $RulesDst $name
    if (Link-One -Source $_.FullName -Destination $dst -Kind HardLink -Label "rule: $name") {
        $installed.Rules += $name
    }
}

Write-Host "Installed (links under %USERPROFILE%\.cursor\):"
Write-Host ""
if ($installed.Skills.Count -gt 0) {
    Write-Host "  Skills:"
    $installed.Skills | ForEach-Object { Write-Host "    - $_" }
    Write-Host ""
}
if ($installed.Agents.Count -gt 0) {
    Write-Host "  Agents:"
    $installed.Agents | ForEach-Object { Write-Host "    - $_" }
    Write-Host ""
}
if ($installed.Rules.Count -gt 0) {
    Write-Host "  Rules:"
    $installed.Rules | ForEach-Object { Write-Host "    - $_" }
    Write-Host ""
}

if ($skipped.Count -gt 0) {
    Write-Host "Skipped (already exist; re-run with -Force to replace):"
    $skipped | ForEach-Object { Write-Host "  - $_" }
    Write-Host ""
}

Write-Host @"
Next:
  1. In Cursor, run 'Developer: Reload Window' (from the command palette).
  2. Try the new slash commands:
       /workshop-plan
       /workshop-work
       /workshop-review

To uninstall, remove each link from %USERPROFILE%\.cursor\:
  Remove-Item -LiteralPath "$env:USERPROFILE\.cursor\skills\workshop-plan" -Recurse
  Remove-Item -LiteralPath "$env:USERPROFILE\.cursor\skills\workshop-work" -Recurse
  Remove-Item -LiteralPath "$env:USERPROFILE\.cursor\skills\workshop-review" -Recurse
  ... and similarly for ~/.cursor/agents/*.md and ~/.cursor/rules/workshop-conventions.mdc
"@
