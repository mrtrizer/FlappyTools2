cmake_minimum_required (VERSION 2.6)

set(CMAKE_BUILD_TYPE Debug)

add_definitions(-std=c++1y)

include_directories(

    "test/test"

)

project (TestProject)

add_executable(TestProject /home/mrtrizer/Projects/flappy_tools/tests/test_project/src/main.cpp)
