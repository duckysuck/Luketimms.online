#!/bin/sh
# Render the Open Graph share image for luketimms.online (the CV site).
# Mirrors blog/gen_og_banner.sh: runs a one-off Alpine + ImageMagick container
# so the host needs no ImageMagick. Re-run if tagline/palette/layout changes.
#
# Design matches index.html: dark #0d0c0a, orange accent #ff5b14, off-white text.

set -eu

OUT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_FILE="og-image.png"

sg docker -c "docker run --rm -v ${OUT_DIR}:/work alpine:3.20 sh -c '
  apk add --no-cache --quiet imagemagick ttf-dejavu >/dev/null 2>&1
  cd /work

  convert -size 1200x630 xc:\"#0d0c0a\" \
    -fill \"#ff5b14\" -draw \"rectangle 0,0 6,630\" \
    -font /usr/share/fonts/dejavu/DejaVuSansMono.ttf -pointsize 26 -kerning 3 \
    -fill \"#ff5b14\" -gravity NorthWest -annotate +80+82 \"DELIVERY LEADER\" \
    -font /usr/share/fonts/dejavu/DejaVuSerif-Bold.ttf -pointsize 104 -kerning -2 \
    -fill \"#f0ece2\" -gravity NorthWest -annotate +76+138 \"Luke Timms.\" \
    -font /usr/share/fonts/dejavu/DejaVuSansMono.ttf -pointsize 24 -kerning 1 \
    -fill \"#a39d8f\" -gravity NorthWest -annotate +80+350 \"PRODUCTION PIPELINES  ·  SCHEDULES  ·  MILESTONES\" \
    -fill \"#a39d8f\" -gravity NorthWest -annotate +80+388 \"SHIPPED END-TO-END\" \
    -font /usr/share/fonts/dejavu/DejaVuSansMono.ttf -pointsize 23 -kerning 2 \
    -fill \"#a39d8f\" -gravity SouthWest -annotate +80+78 \"luketimms.online\" \
    ${OUT_FILE}

  echo \"--- verify ---\"
  identify -format \"size=%wx%h colors=%k\\n\" ${OUT_FILE}
  echo -n \"left-bar(3,300)=       \"; convert ${OUT_FILE} -format \"%[pixel:p{3,300}]\" info:
  echo
  echo -n \"bg-corner(1190,20)=    \"; convert ${OUT_FILE} -format \"%[pixel:p{1190,20}]\" info:
  echo
  echo -n \"bg-mid(600,600)=       \"; convert ${OUT_FILE} -format \"%[pixel:p{600,600}]\" info:
  echo
'"

echo "Wrote ${OUT_DIR}/${OUT_FILE}"