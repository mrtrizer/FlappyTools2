cmake_minimum_required(VERSION 2.6)

project ([= config.name =])

include_directories(
[% for (let i in config.cxx.includes) { %]
    "[= config.cxx.includes[i] =]"
[% } %]
)

[% for (let i in config.cxx.source_dirs ) { %]
    file(APPEND SOURCES [= config.cxx.source_dirs[i] =]*.cpp)
[% } %]

add_definitions("-std=c++1y")

add_library("[= config.moduleName =]" SHARED ${SOURCES})
