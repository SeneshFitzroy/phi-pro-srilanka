Add-Type -AssemblyName System.Drawing

$basePath = "C:\Users\senes\OneDrive\Desktop\FYP\apps\web\public"
$src = [System.Drawing.Image]::FromFile("$basePath\phi-emblem-hq.png")
Write-Host "Source: $($src.Width)x$($src.Height)"

# Convert to 32bpp ARGB
$bmp = New-Object System.Drawing.Bitmap($src.Width, $src.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gDraw = [System.Drawing.Graphics]::FromImage($bmp)
$gDraw.DrawImage($src, 0, 0)
$gDraw.Dispose()
$src.Dispose()

$w = $bmp.Width; $h = $bmp.Height

# Use LockBits for FAST pixel access
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $bmpData.Stride
$totalBytes = [Math]::Abs($stride) * $h
$pixels = New-Object byte[] $totalBytes
[System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $pixels, 0, $totalBytes)
Write-Host "Loaded pixel data: $totalBytes bytes"

# Background color from corners: R=226 G=236 B=201 (greenish tint)
$bgR = 226; $bgG = 236; $bgB = 201
$tolerance = 52

# Phase 1: Classify pixels as potential background
$isBg = New-Object bool[] ($w * $h)
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $idx = $y * $stride + $x * 4  # BGRA order
        $b = $pixels[$idx]; $g = $pixels[$idx+1]; $r = $pixels[$idx+2]
        $dr = $r - $bgR; $dg = $g - $bgG; $db = $b - $bgB
        $dist = [Math]::Sqrt($dr*$dr + $dg*$dg + $db*$db)
        $brightness = ($r + $g + $b) / 3
        $isLight = ($brightness -gt 195 -and $r -gt 180 -and $g -gt 180 -and $b -gt 150)
        if ($dist -lt $tolerance -or $isLight) {
            $isBg[$y * $w + $x] = $true
        }
    }
}
Write-Host "Phase 1: Color classification done"

# Phase 2: Flood fill from edges (integer queue for speed)
$reachable = New-Object bool[] ($w * $h)
$queue = New-Object System.Collections.Generic.Queue[int]

for ($x = 0; $x -lt $w; $x++) {
    if ($isBg[$x]) { $queue.Enqueue($x); $reachable[$x] = $true }
    $bi = ($h-1)*$w + $x
    if ($isBg[$bi]) { $queue.Enqueue($bi); $reachable[$bi] = $true }
}
for ($y = 1; $y -lt $h-1; $y++) {
    $li = $y*$w
    if ($isBg[$li]) { $queue.Enqueue($li); $reachable[$li] = $true }
    $ri = $y*$w + $w - 1
    if ($isBg[$ri]) { $queue.Enqueue($ri); $reachable[$ri] = $true }
}
Write-Host "Phase 2: Seeded $($queue.Count) edge pixels, flood filling..."

while ($queue.Count -gt 0) {
    $pi = $queue.Dequeue()
    $px = $pi % $w; $py = [int]([Math]::Floor($pi / $w))
    if ($px -gt 0)     { $n=$pi-1;  if ($isBg[$n] -and -not $reachable[$n]) { $reachable[$n]=$true; $queue.Enqueue($n) } }
    if ($px -lt $w-1)  { $n=$pi+1;  if ($isBg[$n] -and -not $reachable[$n]) { $reachable[$n]=$true; $queue.Enqueue($n) } }
    if ($py -gt 0)     { $n=$pi-$w; if ($isBg[$n] -and -not $reachable[$n]) { $reachable[$n]=$true; $queue.Enqueue($n) } }
    if ($py -lt $h-1)  { $n=$pi+$w; if ($isBg[$n] -and -not $reachable[$n]) { $reachable[$n]=$true; $queue.Enqueue($n) } }
}
Write-Host "Phase 2: Flood fill complete"

# Phase 3: Make background transparent + anti-alias edges
$bgCount = 0
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        if ($reachable[$y*$w + $x]) {
            $idx = $y * $stride + $x * 4
            $pixels[$idx] = 0; $pixels[$idx+1] = 0; $pixels[$idx+2] = 0; $pixels[$idx+3] = 0
            $bgCount++
        }
    }
}
Write-Host "Phase 3: Removed $bgCount background pixels"

# Phase 4: Anti-alias edges
for ($y = 1; $y -lt $h-1; $y++) {
    for ($x = 1; $x -lt $w-1; $x++) {
        $idx = $y * $stride + $x * 4
        if ($pixels[$idx+3] -gt 0) {
            $tc = 0
            # Check 8 neighbors for transparency
            if ($pixels[$idx - $stride - 4 + 3] -eq 0) { $tc++ }
            if ($pixels[$idx - $stride + 3] -eq 0) { $tc++ }
            if ($pixels[$idx - $stride + 4 + 3] -eq 0) { $tc++ }
            if ($pixels[$idx - 4 + 3] -eq 0) { $tc++ }
            if ($pixels[$idx + 4 + 3] -eq 0) { $tc++ }
            if ($pixels[$idx + $stride - 4 + 3] -eq 0) { $tc++ }
            if ($pixels[$idx + $stride + 3] -eq 0) { $tc++ }
            if ($pixels[$idx + $stride + 4 + 3] -eq 0) { $tc++ }
            if ($tc -gt 0 -and $tc -lt 6) {
                $pixels[$idx+3] = [byte][int](255 * (8 - $tc) / 8)
            }
        }
    }
}
Write-Host "Phase 4: Anti-aliasing done"

# Write pixels back
[System.Runtime.InteropServices.Marshal]::Copy($pixels, 0, $bmpData.Scan0, $totalBytes)
$bmp.UnlockBits($bmpData)

# Phase 5: Find bounding box + crop to square
$minX = $w; $minY = $h; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $idx = $y * $stride + $x * 4
        if ($pixels[$idx+3] -gt 10) {
            if ($x -lt $minX) { $minX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
$contentW = $maxX - $minX + 1; $contentH = $maxY - $minY + 1
Write-Host "Phase 5: Content box x=$minX y=$minY ${contentW}x${contentH}"

# Square canvas with padding
$pad = 10
$sz = [Math]::Max($contentW, $contentH) + 2 * $pad
$square = New-Object System.Drawing.Bitmap($sz, $sz, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gSq = [System.Drawing.Graphics]::FromImage($square)
$gSq.Clear([System.Drawing.Color]::Transparent)
$dx = [int](($sz - $contentW) / 2); $dy = [int](($sz - $contentH) / 2)
$gSq.DrawImage($bmp, (New-Object System.Drawing.Rectangle($dx,$dy,$contentW,$contentH)), (New-Object System.Drawing.Rectangle($minX,$minY,$contentW,$contentH)), [System.Drawing.GraphicsUnit]::Pixel)
$gSq.Dispose()
$bmp.Dispose()
Write-Host "Square: ${sz}x${sz}"

# Resize to 512x512
$final = New-Object System.Drawing.Bitmap(512, 512)
$gF = [System.Drawing.Graphics]::FromImage($final)
$gF.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gF.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gF.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gF.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$gF.Clear([System.Drawing.Color]::Transparent)
$gF.DrawImage($square, 0, 0, 512, 512)
$gF.Dispose()
$square.Dispose()

# Save main emblem
$final.Save("$basePath\phi-emblem.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved phi-emblem.png (512x512, $((Get-Item "$basePath\phi-emblem.png").Length) bytes)"

# Generate PWA icons
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
foreach ($s in $sizes) {
    $icon = New-Object System.Drawing.Bitmap($s, $s)
    $ig = [System.Drawing.Graphics]::FromImage($icon)
    $ig.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $ig.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $ig.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $ig.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $ig.Clear([System.Drawing.Color]::Transparent)
    $ig.DrawImage($final, 0, 0, $s, $s)
    $ig.Dispose()
    $icon.Save("$basePath\icons\icon-${s}x${s}.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $icon.Dispose()
    Write-Host "Icon: ${s}x${s}"
}

# Favicon
$fav = New-Object System.Drawing.Bitmap(32, 32)
$fg = [System.Drawing.Graphics]::FromImage($fav)
$fg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$fg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$fg.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$fg.Clear([System.Drawing.Color]::Transparent)
$fg.DrawImage($final, 0, 0, 32, 32)
$fg.Dispose()
$fav.Save("$basePath\favicon.ico", [System.Drawing.Imaging.ImageFormat]::Icon)
$fav.Dispose()
Write-Host "Favicon: done"

$final.Dispose()
Write-Host "=== ALL DONE ==="
