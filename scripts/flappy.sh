#!/bin/sh
if [ "$1" = "inspect" ]
then
    node --inspect-brk ./flappy.js "${@:2}"
else
    node ./flappy.js "$@"
fi
