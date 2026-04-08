$port = if ($env:PORT) { $env:PORT } else { 3457 }
$root = $PSScriptRoot
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Output "Server running on http://localhost:$port/"
while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $path = $req.Url.LocalPath -replace '^/', ''

    # Root → index.html
    if ($path -eq '' -or $path -eq '/') { $path = 'index.html' }
    # Trailing slash → append index.html  (fixes /yacht-financing/miami/ etc.)
    elseif ($path.EndsWith('/')) { $path = $path + 'index.html' }

    $file = Join-Path $root $path

    # Directory without trailing slash → 301 redirect to add slash
    if (Test-Path $file -PathType Container) {
        $res.StatusCode = 301
        $res.RedirectLocation = '/' + $path + '/'
        $res.OutputStream.Close()
        continue
    }

    if (Test-Path $file -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        $mime = switch ($ext) {
            '.html' { 'text/html; charset=utf-8' }
            '.css'  { 'text/css; charset=utf-8' }
            '.js'   { 'application/javascript' }
            '.png'  { 'image/png' }
            '.jpg'  { 'image/jpeg' }
            '.svg'  { 'image/svg+xml' }
            '.xml'  { 'application/xml' }
            '.txt'  { 'text/plain' }
            default { 'application/octet-stream' }
        }
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $res.ContentType = $mime
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $res.StatusCode = 404
        $body = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found: /$path")
        $res.ContentType = 'text/plain'
        $res.ContentLength64 = $body.Length
        $res.OutputStream.Write($body, 0, $body.Length)
    }
    $res.OutputStream.Close()
}
