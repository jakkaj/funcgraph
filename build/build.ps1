$root = $env:APPVEYOR_BUILD_FOLDER
$versionStr = $env:APPVEYOR_BUILD_NUMBER

Write-Host "Setting .nuspec version tag to $versionStr"

$content = (Get-Content $root\funcgraph.nuspec) 
$content = $content -replace '\$version\$',$versionStr

$content | Out-File $root\funcgraph.compiled.nuspec