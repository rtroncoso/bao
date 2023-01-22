#!/bin/bash

inpattern=$1
outpattern=$2
for infile in *; do
    outfile=$(echo $infile | sed -n "s/$inpattern/$outpattern/p")
    size=$(convert $infile -format "%[fx:2^(ceil(log(w)/log(2)))]" info:)
    echo $size $infile $outfile
    test -z size && continue

    convert $infile -background none -extent $(size)x$(size) $outfile
done
