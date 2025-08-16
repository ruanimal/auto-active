#!/bin/bash

set -x

cd $(dirname $0)

project=$(basename $PWD)
cd ..
version=$(grep -o '"Version": "[^"]*"' "${project}/metadata.json" | grep -o '[0-9.]*')
rm -f "${project}_${version}.kwinscript"
zip -r "${project}_${version}.kwinscript" "${project}" -x "${project}/.git/*"
