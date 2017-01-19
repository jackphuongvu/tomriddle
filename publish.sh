#!/bin/bash

VERSION=$(node --eval "console.log(require('./package.json').version);")

# publish master branch
git commit -am "v$VERSION"

if [[ $1 ]]; then
	# first arg is comment
	git tag -a v$VERSION -m "$1" -f
else
	git tag v$VERSION -f
fi
	
git push --tags -f
git push