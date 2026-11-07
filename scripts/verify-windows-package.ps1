param(
    [Parameter(Mandatory = $true)][string]$PackagePath
)
$ErrorActionPreference = 'Stop'
$package = (Resolve-Path -LiteralPath $PackagePath).Path
$installer = New-Object -ComObject WindowsInstaller.Installer
$database = $installer.OpenDatabase($package, 0)

function Read-MsiTable([string]$Table) {
    $view = $database.OpenView('SELECT * FROM `' + $Table + '`')
    [void]$view.Execute()
    $columns = $view.ColumnInfo(0)
    while ($record = $view.Fetch()) {
        $row = @{}
        $count = $record.GetType().InvokeMember('FieldCount', [Reflection.BindingFlags]::GetProperty, $null, $record, $null)
        for ($index = 1; $index -le $count; $index++) {
            $name = $columns.GetType().InvokeMember('StringData', [Reflection.BindingFlags]::GetProperty, $null, $columns, @($index))
            $row[$name] = $record.GetType().InvokeMember('StringData', [Reflection.BindingFlags]::GetProperty, $null, $record, @($index))
        }
        [PSCustomObject]$row
    }
    [void]$view.Close()
}

$properties = @(Read-MsiTable 'Property')
$directories = @(Read-MsiTable 'Directory')
$registry = @(Read-MsiTable 'Registry')
$removals = @(Read-MsiTable 'RemoveFile')
$product = ($properties | Where-Object Property -eq 'ProductName').Value
if ($product -ne '禾禾充电桩') { throw "Unexpected MSI product name $product" }
$installDirectory = $directories | Where-Object Directory -eq 'INSTALLDIR'
if ($installDirectory.Directory_Parent -ne 'LocalAppDataFolder') { throw 'Expected an application-owned directory directly under LocalAppData' }
if ($directories | Where-Object Directory -eq 'TauriLocalAppDataPrograms') { throw 'Unexpected shared Programs directory component' }
if ($registry | Where-Object Root -ne '1') { throw 'Unexpected machine-wide registry write' }
if ($removals | Where-Object { $_.DirProperty -eq 'TauriLocalAppDataPrograms' }) { throw 'Unsafe shared Programs directory uninstall rule' }
if ($removals | Where-Object { $_.FileName -and $_.DirProperty -ne 'INSTALLDIR' }) { throw 'Uninstall file removal exceeds the application directory' }

$summary = [ordered]@{
    product = $product
    version = ($properties | Where-Object Property -eq 'ProductVersion').Value
    sha256 = (Get-FileHash -LiteralPath $package -Algorithm SHA256).Hash
    signature = (Get-AuthenticodeSignature -LiteralPath $package).Status.ToString()
    perUser = $true
    sharedDirectoryDeletion = $false
    files = @(Read-MsiTable 'File')
    customActions = @(Read-MsiTable 'CustomAction')
    removals = $removals
}
$summary | ConvertTo-Json -Depth 5
