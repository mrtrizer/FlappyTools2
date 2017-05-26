cmake_minimum_required(VERSION 2.6)

project ([= config.name =])

set(CMAKE_BUILD_TYPE Debug)

add_definitions([= config.flags.join(" ") =])

include_directories(
[% for (let i in config.cxx.header_dirs) { %]
    "[= normalize(config.cxx.header_dirs[i]) =]"
[% } %]
)

[% let normalizedSources = sourceList(projectRoot, config.cxx.src_dirs, config.cxx.src_exclude); %]

[% for (let i in normalizedSources) { %]
    list(APPEND SOURCES "[= normalizedSources[i] =]")
[% } %]

add_library("[= config.name =]" SHARED ${SOURCES})
