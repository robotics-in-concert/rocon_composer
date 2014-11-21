##############################################################################
# CMake
##############################################################################

cmake_minimum_required(VERSION 2.8.3)
project(rocon_authoring)

##############################################################################
# Catkin
##############################################################################
find_package(catkin REQUIRED)

#catkin_npm_update() Under development

catkin_package()
catkin_add_env_hooks(25.rocon-authoring SHELLS sh DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/env-hooks)
