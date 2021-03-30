#!/bin/bash

inpattern=$1
outpattern=$2
for infile in *; do
    outfile=$(echo $infile | sed -n "s/$inpattern/$outpattern/p")
    width=$(convert $infile -format "%[fx:(ceil(w/32)*32)-w]" info:)
    width=$(convert $infile -format "%[fx:(ceil(h/32)*32)-h]" info:)
    echo $width $height $infile $outfile
    test -z $width && test -z $height && continue

    convert $infile -background none -extent $(width)x$(height) $outfile
done
