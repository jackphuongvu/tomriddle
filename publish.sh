#!/bin/bash

VERSION=$(node --eval "console.log(require('./package.json').version);")

# publish master branch
git commit -am "v$VERSION"
git tag v$VERSION -f
git push --tags -f
git push