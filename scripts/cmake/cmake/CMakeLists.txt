cmake_minimum_required (VERSION 3.1.0)
project([= config.name =] LANGUAGES CXX C)

[% if (projectRoot == moduleRoot) { %]

    # Generation of compilation database
    set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
    #IF( EXISTS "${CMAKE_CURRENT_BINARY_DIR}/compile_commands.json" )
    #  EXECUTE_PROCESS( COMMAND ${CMAKE_COMMAND} -E copy_if_different
    #    ${CMAKE_CURRENT_BINARY_DIR}/compile_commands.json
    #    [= moduleRoot =]/compile_commands.json
    #  )
    #ENDIF()

    # Add subdirectories of all nested submodules to reffer them from other places
    # and avoid cross-refference problems.
    [% for (let i in overallModules) { %]
        add_subdirectory([= cmakeNormalize(overallModules[i].outDir) =])
    [% } %]
[% } %]
set(CMAKE_BUILD_TYPE Debug)


[% if (config.cmake.subdirectories) { %]
    [% for (let i in config.cmake.subdirectories) { %]
         add_subdirectory([= cmakeNormalize(config.cmake.subdirectories[i]) =] [=cmakeNormalize(outDir) + "/build/sub/" + cmakeNormalize(config.cmake.subdirectories[i]) =])
    [% } %]
[% } %]

# C++ standard
[% if (config.cmake.cxx_standard) { %]
    set(CMAKE_CXX_STANDARD [= config.cmake.cxx_standard =])
    set(CMAKE_CXX_STANDARD_REQUIRED ON)
[% } %]

# List all sources from all presented sources excluding exclude pathes
[% const normalizedSources = sourceList(config.cxx.src_dirs, config.cxx.src_exclude); %]
[% for (let i in normalizedSources) { %]
    list(APPEND [= config.name =]_SOURCES "[= cmakeNormalize(normalizedSources[i]) =]")
[% } %]

[% if (projectRoot == moduleRoot) { %]
    [% if (config.cxx.type == "shared_lib") { %]
        add_library([= config.name =] SHARED ${[= config.name =]_SOURCES})
    [% } else if (config.cxx.type == "static_lib") { %]
        add_library([= config.name =] ${[= config.name =]_SOURCES})
    [% } else if (config.cxx.type == "executable") { %]
        add_executable([= config.name =] ${[= config.name =]_SOURCES})
    [% } %]
[% } else { %]
    add_library([= config.name =] ${[= config.name =]_SOURCES})
[% } %]

# Pathes for header search
target_include_directories([= config.name =]
[= (projectRoot == moduleRoot ? "PRIVATE" : "PUBLIC") =]
[% for (let i in config.cxx.header_dirs) { %]
    "[= cmakeNormalize(config.cxx.header_dirs[i]) =]"
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
if (CMAKE_CXX_COMPILER_ID MATCHES "Clang")
    target_compile_options([= config.name =] PRIVATE [= config.cxx.flags.join(" ") =] [= config.cxx.flags_clang.join(" ") =])
    target_link_libraries([= config.name =] PRIVATE [= config.cxx.link_flags.join(" ") =] [= config.cxx.link_flags_clang.join(" ") =])
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU")
    target_compile_options([= config.name =] PRIVATE [= config.cxx.flags.join(" ") =] [= config.cxx.flags_gnu.join(" ") =])
    target_link_libraries([= config.name =] PRIVATE [= config.cxx.link_flags.join(" ") =] [= config.cxx.link_flags_gnu.join(" ") =])
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "Intel")
    target_compile_options([= config.name =] PRIVATE [= config.cxx.flags.join(" ") =] [= config.cxx.flags_intel.join(" ") =])
    target_link_libraries([= config.name =] PRIVATE [= config.cxx.link_flags.join(" ") =] [= config.cxx.link_flags_intel.join(" ") =])
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
    target_compile_options([= config.name =] PRIVATE [= config.cxx.flags_msvc.join(" ") =])
    target_link_libraries([= config.name =] PRIVATE [= config.cxx.link_flags_msvc.join(" ") =])
endif()

[% if (config.cmake.module_path) { %]
    set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "[= cmakeNormalize(config.cmake.module_path) =]")
    set(CMAKE_PREFIX_PATH ${CMAKE_MODULE_PATH} "[= cmakeNormalize(config.cmake.module_path) =]")
[% } %]

[% for (let i in config.cmake.packages) { %]
    find_package([= config.cmake.packages[i].name =] REQUIRED)
    target_include_directories([= config.name =] PUBLIC [= config.cmake.packages[i].includes =])
    target_link_libraries([= config.name =] [= config.cmake.packages[i].libs =])
[% } %]

[% if (config.cxx.libs != undefined) { %]
    [% if (config.cxx.libs.length > 0) {%]
    	target_link_libraries([= config.name =]
    	[% for (let i in config.cxx.libs) { %]
    	     "[= cmakeNormalize(config.cxx.libs[i]) =]"
    	[% } %]
    	)
    [% } %]
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
[% } %]
