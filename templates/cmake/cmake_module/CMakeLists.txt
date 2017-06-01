cmake_minimum_required (VERSION 3.5.1)

set(CMAKE_BUILD_TYPE Debug)

# List all sources from all presented sources excluding exclude pathes
[% let normalizedSources = sourceList(projectRoot, config.cxx.src_dirs, config.cxx.src_exclude); %]
[% for (let i in normalizedSources) { %]
    list(APPEND [= config.name =]_SOURCES "[= normalizedSources[i] =]")
[% } %]

add_library([= config.name =] SHARED ${[= config.name =]_SOURCES})

target_include_directories ([= config.name =] PUBLIC 
[% for (let i in config.cxx.header_dirs) { %]
     "[= normalize(config.cxx.header_dirs[i]) =]"
[% } %]
)

[% if (modules.length > 0) {%]
# Refer to dependencies. Look at main CMakeLists to find add_subdirectory calls.
    target_link_libraries([= config.name =]
    [% for (let i in modules) { %]
        [= modules[i].config.name =]
    [% } %]
    )
[% } %]

# All preprocessor defenition from module configuration
target_compile_options([= config.name =] PRIVATE [= config.flags.join(" ") =])
