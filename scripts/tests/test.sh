#!/bin/sh
../flappy.js init cpp test_project
pushd test_project
../../flappy.js build cmake
popd
rm -r test_project
