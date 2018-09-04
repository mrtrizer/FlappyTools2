## Status
Installation and test

[![Build Status](https://travis-ci.org/mrtrizer/FlappyTools2.svg?branch=master)](https://travis-ci.org/mrtrizer/FlappyTools2)
[![Build status](https://ci.appveyor.com/api/projects/status/9bqsa6v6fgrvcbaw?svg=true)](https://ci.appveyor.com/project/mrtrizer/flappytools2)

## Installation
Tested on OSX, Ubuntu and Windows 10.
Before installation you need:
* node-js >= 4.2.6
* cmake >= 3.5.1

To install:
1. Download repo any convinient way
2. Create build folder
3. Enter build folder
4. Run `cmake -G "Unix Makefiles" ..`
5. Run `make install` under root (with sudo)

Windows:
1. Install cmake, vs build tools, and node.js
2. Open vs build tools console
3. Enter FlappyTools2/scripts
4. npm install

To build project on Windows: 
1. Enter target project dir
2. <path>\flappy gen cmake
3. cd generated\cmake
4. cmake -G "Visual Studio 15 2017"
5. cmake --build . --target ALL_BUILD --config Release
6. You executable is in Release folder

After installation you can run `flappy --help` and look at repository wiki for
details.

Using example:
1. flappy init cpp <Project name>
2. cd <Project name>
3. flappy gen cmake
4. flappy build cmake

