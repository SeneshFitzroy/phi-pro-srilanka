Add-Type -AssemblyName System.Drawing

$basePath = "C:\Users\senes\OneDrive\Desktop\FYP\apps\web\public"
$src = [System.Drawing.Image]::FromFile("$basePath\phi-emblem-hq.png")
Write-Host "Source: $($src.Width)x$($src.Height)"

$bmp = New-Object System.Drawing.Bitmap($src)

# Background color sampled from corners: R=226 G=236 B=201 (olive/green tint)
$bgR = 226; $bgG = 236; $bgB = 201

# ---- FLOOD FILL background removal from all edges ----
$w = $bmp.Width; $h = $bmp.Height
$isBackground = New-Object 'bool[,]' $w, $h
$colorTolerance = 55  # how far from bg color to still count as background

# Queue-based flood fill from all edge pixels
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

# Seed all edge pixels
for ($x = 0; $x -lt $w; $x++) {
    $queue.Enqueue((New-Object System.Drawing.Point($x, 0)))
    $queue.Enqueue((New-Object System.Drawing.Point($x, $h - 1)))
}
for ($y = 1; $y -lt $h - 1; $y++) {
    $queue.Enqueue((New-Object System.Drawing.Point(0, $y)))
    $queue.Enqueue((New-Object System.Drawing.Point($w - 1, $y)))
}

$visited = New-Object 'bool[,]' $w, $h

while ($queue.Count -gt 0) {
    $pt = $queue.Dequeue()
    $px = $pt.X; $py = $pt.Y
    if ($px -lt 0 -or $px -ge $w -or $py -lt 0 -or $py -ge $h) { continue }
    if ($visited[$px, $py]) { continue }
    $visited[$px, $py] = $true
    
    $p = $bmp.GetPixel($px, $py)
    $dist = [Math]::Sqrt(($p.R - $bgR) * ($p.R - $bgR) + ($p.G - $bgG) * ($p.G - $bgG) + ($p.B - $bgB) * ($p.B - $bgB))
    
    # Also treat very light pixels as background
    $brightness = ($p.R + $p.G + $p.B) / 3
    $isLight = ($brightness -gt 200 -and $p.R -gt 180 -and $p.G -gt 180 -and $p.B -gt 160)
    
    if ($dist -lt $colorTolerance -or $isLight) {
        $isBackground[$px, $py] = $true
        # Add 4-connected neighbors
        if ($px -gt 0) { $queue.Enqueue((New-Object System.Drawing.Point(($px-1), $py))) }
        if ($px -lt $w-1) { $queue.Enqueue((New-Object System.Drawing.Point(($px+1), $py))) }
        if ($py -gt 0) { $queue.Enqueue((New-Object System.Drawing.Point($px, ($py-1)))) }
        if ($py -lt $h-1) { $queue.Enqueue((New-Object System.Drawing.Point($px, ($py+1)))) }
    }
}

Write-Host "Flood fill complete"

# Convert to 32bpp ARGB and apply transparency
$result = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gTemp = [System.Drawing.Graphics]::FromImage($result)
$gTemp.DrawImage($bmp, 0, 0)
$gTemp.Dispose()

$bgCount = 0
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        if ($isBackground[$x, $y]) {
            $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            $bgCount++
        }
    }
}
Write-Host "Removed $bgCount background pixels out of $($w*$h) total"

# ---- Anti-alias edges ----
$aaResult = New-Object System.Drawing.Bitmap($result)
for ($y = 1; $y -lt $h - 1; $y++) {
    for ($x = 1; $x -lt $w - 1; $x++) {
        $p = $result.GetPixel($x, $y)
        if ($p.A -gt 0) {
            $transCount = 0
            for ($dy = -1; $dy -le 1; $dy++) {
                for ($dx = -1; $dx -le 1; $dx++) {
                    if ($dx -eq 0 -and $dy -eq 0) { continue }
                    $np = $result.GetPixel($x + $dx, $y + $dy)
                    if ($np.A -eq 0) { $transCount++ }
                }
            }
            if ($transCount -gt 0 -and $transCount -lt 6) {
                $alpha = [int](255 * (8 - $transCount) / 8)
                $aaResult.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
            }
        }
    }
}
$result.Dispose()
Write-Host "Edge anti-aliasing applied"

# ---- Find bounding box of non-transparent pixels ----
$minX = $w; $minY = $h; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $p = $aaResult.GetPixel($x, $y)
        if ($p.A -gt 0) {
            if ($x -lt $minX) { $minX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Content bounding box: x=$minX y=$minY to x=$maxX y=$maxY"
$contentW = $maxX - $minX + 1
$contentH = $maxY - $minY + 1

# Make square with padding
$pad = 8
$squareSize = [Math]::Max($contentW, $contentH) + 2 * $pad
$centerX = $minX + $contentW / 2
$centerY = $minY + $contentH / 2

Write-Host "Content: ${contentW}x${contentH}, Square target: ${squareSize}"

# Create square canvas and draw centered
$square = New-Object System.Drawing.Bitmap($squareSize, $squareSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gSq = [System.Drawing.Graphics]::FromImage($square)
$gSq.Clear([System.Drawing.Color]::Transparent)
$drawX = [int](($squareSize - $contentW) / 2)
$drawY = [int](($squareSize - $contentH) / 2)
$srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $contentW, $contentH)
$destRect = New-Object System.Drawing.Rectangle($drawX, $drawY, $contentW, $contentH)
$gSq.DrawImage($aaResult, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$gSq.Dispose()
$aaResult.Dispose()

Write-Host "Created square canvas: ${squareSize}x${squareSize}"

# Resize to 512x512 with high quality
$final = New-Object System.Drawing.Bitmap(512, 512)
$g = [System.Drawing.Graphics]::FromImage($final)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($square, 0, 0, 512, 512)
$g.Dispose()
$square.Dispose()

# Save main emblem
$final.Save("$basePath\phi-emblem.png", [System.Drawing.Imaging.ImageFormat]::Png)
$fi = Get-Item "$basePath\phi-emblem.png"
Write-Host "Saved phi-emblem.png (512x512, $($fi.Length) bytes)"

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
    Write-Host "Generated icon-${s}x${s}.png"
}

# Generate favicon.ico (32x32 in ICO format)
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
Write-Host "Generated favicon.ico"

$final.Dispose()
$bmp.Dispose()
$src.Dispose()

Write-Host "ALL DONE - Emblem processed successfully!"
