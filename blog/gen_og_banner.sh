#!/bin/sh
# Render the default Open Graph banner used for link previews on shares
# of blog.luketimms.online. Runs inside a one-off Alpine + ImageMagick
# container so the host does not need ImageMagick installed.
#
# Re-run if the tagline, palette, or layout changes.

set -eu

OUT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_FILE="og-banner.png"

sg docker -c "docker run --rm -v ${OUT_DIR}:/work alpine:3.20 sh -c '
  apk add --no-cache --quiet imagemagick ttf-dejavu >/dev/null 2>&1
  cd /work
  convert -size 1200x630 xc:\"#000000\" \
    -font /usr/share/fonts/dejavu/DejaVuSansMono-Bold.ttf -pointsize 30 -kerning 6 \
    -fill \"#ff0055\" -gravity NorthWest -annotate +80+100 \"LUKES BLOG\" \
    -fill \"#ff0055\" -draw \"rectangle 80,150 200,158\" \
    -font /usr/share/fonts/dejavu/DejaVuSans-Bold.ttf -pointsize 88 -kerning -2 \
    -fill \"#ffffff\" -gravity NorthWest -annotate +76+215 \"BRAIN FARTS TO\" \
    -annotate +76+320 \"TANGIBLE OUTCOMES.\" \
    -font /usr/share/fonts/dejavu/DejaVuSansMono.ttf -pointsize 26 -kerning 2 \
    -fill \"#a0a0a0\" -gravity SouthWest -annotate +80+80 \"blog.luketimms.online\" \
    ${OUT_FILE}
'"

echo "Wrote ${OUT_DIR}/${OUT_FILE}"
