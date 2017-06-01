cmake_minimum_required (VERSION 3.5.1)

set(CMAKE_BUILD_TYPE Debug)

# Generation of compilation database
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
IF( EXISTS "${CMAKE_CURRENT_BINARY_DIR}/compile_commands.json" )
  EXECUTE_PROCESS( COMMAND ${CMAKE_COMMAND} -E copy_if_different
    ${CMAKE_CURRENT_BINARY_DIR}/compile_commands.json
    [= projectRoot =]/compile_commands.json
  )
ENDIF()

# List all sources from all presented sources excluding exclude pathes
[% const normalizedSources = sourceList(projectRoot, config.cxx.src_dirs, config.cxx.src_exclude); %]
[% for (let i in normalizedSources) { %]
    list(APPEND [= config.name =]_SOURCES "[= normalizedSources[i] =]")
[% } %]

# Add subdirectories of all nested submodules to reffer them from other places
# and avoid cross-refference problems.
[% for (let i in overallModules) { %]
    add_subdirectory([= overallModules[i].outDir =])
[% } %]

add_executable([= config.name =] ${[= config.name =]_SOURCES})

# Pathes for header search
target_include_directories([= config.name =] PRIVATE
[% for (let i in config.cxx.header_dirs) { %]
    "[= normalize(config.cxx.header_dirs[i]) =]"
[% } %]
)

[% if (modules.length > 0) {%]
    target_link_libraries([= config.name =]
    [% for (let i in modules) { %]
        [= modules[i].config.name =]
    [% } %]
    )
[% } %]

# All preprocessor defenition from configuration
target_compile_options([= config.name =] PRIVATE [= config.flags.join(" ") =])

