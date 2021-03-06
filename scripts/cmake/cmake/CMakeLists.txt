cmake_minimum_required (VERSION 3.1.0)
project([= config.name =] LANGUAGES CXX C)

[% if (projectRoot == moduleRoot) { %]
    # Prepare a script to run all built targets. The script is populated later in submodules recursively
    add_custom_target(
        PrepareRunExecutables_[= config.name =] ALL
        COMMAND ${CMAKE_COMMAND} -E echo "#!/bin/sh" > exec.sh && chmod +x exec.sh
        VERBATIM)
    # Next variables are used in submodules
    set (MAIN_DIR ${CMAKE_BINARY_DIR})
    set (ROOT_DIR ${PROJECT_SOURCE_DIR})
[% } %]

[% if (projectRoot == moduleRoot) { %]
    # Generation of compilation database
    set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

    # Add subdirectories of all nested submodules to reffer them from other places
    # and avoid cross-refference problems.
    [% for (let i in overallModules) { %]
        add_subdirectory([= cmakeNormalize(overallModules[i].outDir) =])
    [% } %]
[% } %]

set(CMAKE_BUILD_TYPE Debug)

[% if (typeof(config.cmake) === "object" && typeof(config.cmake.subdirectories) === "object") { %]
    [% for (let i in config.cmake.subdirectories) { %]
         add_subdirectory([= cmakeNormalize(config.cmake.subdirectories[i]) =] [=cmakeNormalize(outDir) + "/build/sub/" + cmakeNormalize(config.cmake.subdirectories[i]) =])
    [% } %]
[% } %]

[% if (typeof(config.cxx) === "object") { %]
    # List all sources from all presented sources excluding exclude pathes
    [% const normalizedSources = sourceList(config.cxx.src_dirs, config.cxx.src_exclude); %]
    [% for (let i in normalizedSources) { %]
        list(APPEND [= config.name =]_SOURCES "[= cmakeNormalize(normalizedSources[i]) =]")
    [% } %]

    [% if (config.cxx.type == "shared_lib") { %]
        add_library([= config.name =] SHARED ${[= config.name =]_SOURCES})
    [% } else if (config.cxx.type == "static_lib") { %]
        add_library([= config.name =] ${[= config.name =]_SOURCES})
    [% } else if (config.cxx.type == "executable") { %]
        add_executable([= config.name =] ${[= config.name =]_SOURCES})
    [% } else { %]
        add_executable([= config.name =] ${[= config.name =]_SOURCES})
    [% } %]

    [% if (config.cxx.type == "executable") { %]
    # This target adds executable to the list of executables in the root of a project. This is needed to be able run all
    # executables in project with one command and right working directory
        add_custom_target(
            RunExecutables_[= config.name =] ALL
            COMMAND ${CMAKE_COMMAND} -E echo "(cd ${ROOT_DIR} && $<TARGET_FILE:[= config.name =]>)" >> ${MAIN_DIR}/exec.sh
            VERBATIM
        )
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
            [% const module = modules[i] %]
            [% if (typeof(module.config.cxx) === "object" && module.config.cxx.type != "executable") { %]
                [= module.config.name =]
            [% } %]
        [% } %]
        )
    [% } %]

    [% const flags = (config.cxx.flags || []).join() %]
    [% const linkFlags = (config.cxx.link_flags || []).join() %]
    [% const flagsClang = (config.cxx.flags_clang || []).join() %]
    [% const linkFlagsClang = (config.cxx.link_flags_clang || []).join() %]
    [% const flagsGnu = (config.cxx.flags_gnu || []).join() %]
    [% const linkFlagsGnu = (config.cxx.link_flags_gnu || []).join() %]
    [% const flagsIntel = (config.cxx.flags_intel || []).join() %]
    [% const linkFlagsIntel = (config.cxx.link_flags_intel || []).join() %]
    [% const flagsMsvc = (config.cxx.flags_msvc || []).join() %]
    [% const linkFlagsMsvc = (config.cxx.link_flags_msvc || []).join() %]

    # All preprocessor defenition from module configuration
    if (CMAKE_CXX_COMPILER_ID MATCHES "Clang")
        target_compile_options([= config.name =] PRIVATE [= flags =] [= flagsClang =])
        target_link_libraries([= config.name =] [= linkFlags =] [= linkFlagsClang =])
    elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU")
        target_compile_options([= config.name =] PRIVATE [= flags =] [= flagsGnu =])
        target_link_libraries([= config.name =] [= linkFlags =] [= linkFlagsGnu =])
    elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "Intel")
        target_compile_options([= config.name =] PRIVATE [= flags =] [= flagsIntel =])
        target_link_libraries([= config.name =] [= linkFlags =] [= linkFlagsIntel =] )
    elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
        target_compile_options([= config.name =] PRIVATE [= flagsMsvc =])
        target_link_libraries([= config.name =] [= linkFlagsMsvc =])
    endif()

    [% const defaultStandard = "c++17" %]
    if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
        target_compile_options([= config.name =] PRIVATE "/std:[= config.cxx.standard || defaultStandard =]")
    else()
        target_compile_options([= config.name =] PRIVATE "-std=[= config.cxx.standard || defaultStandard =]")
    endif()

    [% if (typeof(config.cmake) == "object") { %]
        [% if (config.cmake.module_path) { %]
            set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "[= cmakeNormalize(config.cmake.module_path) =]")
            set(CMAKE_PREFIX_PATH ${CMAKE_MODULE_PATH} "[= cmakeNormalize(config.cmake.module_path) =]")
        [% } %]

        [% if (typeof(config.cmake.packages) == "object") { %]
            [% for (let i in config.cmake.packages) { %]
                find_package([= config.cmake.packages[i].name =] REQUIRED)
                target_include_directories([= config.name =] PUBLIC [= config.cmake.packages[i].includes =])
                target_link_libraries([= config.name =] [= config.cmake.packages[i].libs =])
            [% } %]
        [% } %]
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
[% } %]
