## Installation
Tested on OSX and Ubuntu. Windows is not supported yet.
Before installation you need:
* node-js >= 4.2.6
* cmake >= 3.5.1

To install:
1. Download repo any convinient way
2. Create build folder
3. Enter build folder
4. Run `cmake -G "Unix Makefiles" ..`
5. Run `make install` under root (with sudo)

After installation you can run `flappy --help` and look at repository wiki for
details.

Using example:
1. flappy init cpp <Project name>
2. cd <Project name>
3. flappy gen cmake
4. flappy build cmake

