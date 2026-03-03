Add-Type -AssemblyName System.Drawing

$basePath = "C:\Users\senes\OneDrive\Desktop\FYP\apps\web\public"
$src = [System.Drawing.Image]::FromFile("$basePath\phi-emblem-hq.png")
Write-Host "Source: $($src.Width)x$($src.Height)"

$bmp = New-Object System.Drawing.Bitmap($src)

# Find bounding box of the emblem (non-light pixels)
$minX = $bmp.Width; $minY = $bmp.Height; $maxX = 0; $maxY = 0
$threshold = 200

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt $threshold -or $p.G -lt $threshold -or $p.B -lt $threshold) {
            if ($x -lt $minX) { $minX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Bounding box: x=$minX y=$minY to x=$maxX y=$maxY"
$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1
Write-Host "Crop region: ${cropW}x${cropH}"

# Add padding
$pad = 6
$cx = [Math]::Max(0, $minX - $pad)
$cy = [Math]::Max(0, $minY - $pad)
$cw = [Math]::Min($bmp.Width - $cx, $cropW + 2*$pad)
$ch = [Math]::Min($bmp.Height - $cy, $cropH + 2*$pad)

# Make it square (use the larger dimension)
$size = [Math]::Max($cw, $ch)
$centerX = $cx + $cw/2
$centerY = $cy + $ch/2
$sx = [Math]::Max(0, [int]($centerX - $size/2))
$sy = [Math]::Max(0, [int]($centerY - $size/2))

# Ensure we don't go out of bounds
if ($sx + $size -gt $bmp.Width) { $sx = $bmp.Width - $size }
if ($sy + $size -gt $bmp.Height) { $sy = $bmp.Height - $size }
if ($sx -lt 0) { $sx = 0; $size = $bmp.Width }
if ($sy -lt 0) { $sy = 0; $size = [Math]::Min($size, $bmp.Height) }

# Make sure size is square and fits
$finalCropSize = [Math]::Min($size, [Math]::Min($bmp.Width - $sx, $bmp.Height - $sy))
Write-Host "Square crop: x=$sx y=$sy size=$finalCropSize"

# Crop to square region
$cropRect = New-Object System.Drawing.Rectangle($sx, $sy, $finalCropSize, $finalCropSize)
$cropped = $bmp.Clone($cropRect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

Write-Host "Cropped to $($cropped.Width)x$($cropped.Height)"

# Remove background - make light/whitish/greenish-white pixels transparent
# Use a smart approach: check if pixel is "background-like"
for ($y = 0; $y -lt $cropped.Height; $y++) {
    for ($x = 0; $x -lt $cropped.Width; $x++) {
        $p = $cropped.GetPixel($x, $y)
        $brightness = ($p.R + $p.G + $p.B) / 3
        
        # Light background pixels (white/off-white/light green tint)
        if ($brightness -gt 195 -and $p.R -gt 180 -and $p.G -gt 180 -and $p.B -gt 170) {
            $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

Write-Host "Background removed"

# Now do edge anti-aliasing pass - soften edges between transparent and non-transparent
# Check pixels adjacent to transparent ones and make them semi-transparent for smooth edges
$edgeBmp = New-Object System.Drawing.Bitmap($cropped)
for ($y = 1; $y -lt $cropped.Height - 1; $y++) {
    for ($x = 1; $x -lt $cropped.Width - 1; $x++) {
        $p = $cropped.GetPixel($x, $y)
        if ($p.A -gt 0) {
            # Count transparent neighbors
            $transCount = 0
            for ($dy = -1; $dy -le 1; $dy++) {
                for ($dx = -1; $dx -le 1; $dx++) {
                    if ($dx -eq 0 -and $dy -eq 0) { continue }
                    $np = $cropped.GetPixel($x + $dx, $y + $dy)
                    if ($np.A -eq 0) { $transCount++ }
                }
            }
            # If on edge (has transparent neighbors), apply partial transparency
            if ($transCount -gt 0 -and $transCount -lt 6) {
                $alpha = [int](255 * (8 - $transCount) / 8)
                $edgeBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
            }
        }
    }
}
$cropped.Dispose()
$cropped = $edgeBmp

Write-Host "Edge anti-aliasing applied"

# Resize to 512x512 with high quality
$final = New-Object System.Drawing.Bitmap(512, 512)
$g = [System.Drawing.Graphics]::FromImage($final)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($cropped, 0, 0, 512, 512)
$g.Dispose()

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
$cropped.Dispose()
$bmp.Dispose()
$src.Dispose()

Write-Host "ALL DONE - Emblem processed successfully!"
