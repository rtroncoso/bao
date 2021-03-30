#!/bin/bash

inpattern=$1
outpattern=$2
for infile in *; do
    outfile=$(echo $infile | sed -n "s/$inpattern/$outpattern/p")
    convert $infile -background none -trim -fuzz 0% +repage $outfile
done
