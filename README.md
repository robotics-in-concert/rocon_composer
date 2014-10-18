rocon_authoring
===============

## Pre-requisites
* install nodejs in ubuntu
    *  https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-debian-linux-mint-elementary-os-etc

* libcairo to build node-canvas

    ```
    $ sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
    $ npm install canvas
    ```
* rosbridge
    
    ```
    > sudo apt-get install ros-<version>-rosbridge-suite
    ```

* mongodb
    ```
    > sudo apt-get install mongodb
    > sudo start mongodb
    ```

## Required Environment Variables

  - `PORT` : The port to run engine's web interface.
  - `ROS_WS_URL` : Rosbridge websocket URL (eg. ws://127.0.0.1:9090)
  - `MONGO_URL` : mongodb connection URL (eg. mongodb://localhost:27017/cento_authoring)
  - `MSG_DATABASE` : message database server address (eg. http://localhost:10000)

## Run

### Rosbridge
```
> roslaunch rosbridge_server rosbridge_websocket.launch --screen
```
### Authoring Tool & Engine
```
$ npm install
$ MONGO_URL=mongodb://localhost:27017/cento_authoring PORT=9999 ROS_WS_URL=ws://127.0.0.1:9090 node rocon_authoring.js
```
or
```
>> export MONGO_URL=mongodb://localhost:27017/cento_authoring
>> export PORT=9999
>> export ROS_WS_URL=ws://:9090
>> node rocon_authoring.js

```

* Reason of using ROS_WS_URL port, 9090
    * rosbridge default port is 9090. If you change the port, you should change the rosbrdige server port when it is launched.
