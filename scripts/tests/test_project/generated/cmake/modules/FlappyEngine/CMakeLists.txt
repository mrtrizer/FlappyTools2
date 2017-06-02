cmake_minimum_required(VERSION 2.6)

project (TestProject)

include_directories(

    "test/test"

)



add_definitions("-std=c++1y")

add_library("undefined" SHARED ${SOURCES})
