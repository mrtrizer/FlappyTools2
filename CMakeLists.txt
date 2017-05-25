cmake_minimum_required(VERSION 2.8)
project (FlappyTools)

install(DIRECTORY ./scripts DESTINATION flappytools/ USE_SOURCE_PERMISSIONS)
install(DIRECTORY ./templates DESTINATION flappytools/ USE_SOURCE_PERMISSIONS)
install(CODE "execute_process(COMMAND ln -sf ${CMAKE_INSTALL_PREFIX}/flappytools/scripts/flappy.js /usr/local/bin/flappy)")

configure_file(
    "${CMAKE_CURRENT_SOURCE_DIR}/cmake_uninstall.cmake.in"
    "${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake"
    IMMEDIATE @ONLY)

add_custom_target(uninstall
    COMMAND ${CMAKE_COMMAND} -P ${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake)
