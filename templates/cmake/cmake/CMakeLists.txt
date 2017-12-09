cmake_minimum_required (VERSION 3.0.2)

[% if (projectRoot == moduleRoot) { %]
    project([= config.name =])

    # Add subdirectories of all nested submodules to reffer them from other places
    # and avoid cross-refference problems.
    [% for (let i in overallModules) { %]
        add_subdirectory([= overallModules[i].outDir =])
    [% } %]
[% } %]
set(CMAKE_BUILD_TYPE Debug)

# List all sources from all presented sources excluding exclude pathes
[% const normalizedSources = sourceList(config.cxx.src_dirs, config.cxx.src_exclude); %]
[% for (let i in normalizedSources) { %]
    list(APPEND [= config.name =]_SOURCES "[= normalizedSources[i] =]")
[% } %]

[% if (projectRoot == moduleRoot) { %]
    add_executable([= config.name =] ${[= config.name =]_SOURCES})
[% } else { %]
    add_library([= config.name =] SHARED ${[= config.name =]_SOURCES})
[% } %]

# Pathes for header search
target_include_directories([= config.name =]
[= (projectRoot == moduleRoot ? "PRIVATE" : "PUBLIC") =]
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
target_compile_options([= config.name =] PRIVATE [= config.cxx.flags.join(" ") =])

[% for (let i in config.cmake.packages) { %]
    find_package([= config.cmake.packages[i].name =] REQUIRED)
    target_include_directories([= config.name =] PUBLIC [= config.cmake.packages[i].includes =])
    target_link_libraries([= config.name =] [= config.cmake.packages[i].libs =])
[% } %]

[% if (config.cxx.libs != undefined) { %]
    [% if (config.cxx.libs.length > 0) {%]
    	target_link_libraries([= config.name =]
    	[% for (let i in config.cxx.libs) { %]
    	     "[= normalize(config.cxx.libs[i]) =]"
    	[% } %]
    	)
    [% } %]
[% } %]

[% if (config.cmake.module_path) { %]
    set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "[= normalize(config.cmake.module_path) =]")
[% } %]

[% if (projectRoot == moduleRoot) { %]
    if (NOT (${CMAKE_SOURCE_DIR} STREQUAL ${CMAKE_CURRENT_BINARY_DIR}))
        if (EXISTS ${CMAKE_SOURCE_DIR}/resources)
            add_custom_command(
                    TARGET [= config.name =] POST_BUILD
                    COMMAND cp -R
                            ${CMAKE_SOURCE_DIR}/resources
                            ${CMAKE_CURRENT_BINARY_DIR}/)
        endif()
    endif()

    # Generation of compilation database
    set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
    IF( EXISTS "${CMAKE_CURRENT_BINARY_DIR}/compile_commands.json" )
      EXECUTE_PROCESS( COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_BINARY_DIR}/compile_commands.json
        [= moduleRoot =]/compile_commands.json
      )
    ENDIF()
[% } %]
