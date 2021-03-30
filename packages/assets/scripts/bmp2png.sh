#!/bin/bash

inpattern=$1
outpattern=$2
for infile in *; do
    outfile=$(echo $infile | sed -n "s/$inpattern/$outpattern/p")
    convert $infile -channel Index -transparent '#000000' -fuzz 15% $outfile
done
