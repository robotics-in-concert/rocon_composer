rocon_authoring
===============

## Pre-requisites


* libcairo to build node-canvas

    ```
    $ sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
    $ npm install canvas
    ```
* rosbridge
    
    ```
    > sudo apt-get install ros-<version>-rosbridge-suite
    ```

## Required Environment Variables

  - `PORT` : The port to run engine's web interface.
  - `ROS_WS_URL` : Rosbridge websocket URL (eg. ws://127.0.0.1:9090)

## Run

### Rosbridge
```
> roslaunch rosbridge_server rosbridge_websocket.launch --screen
```
### Authoring Tool & Engine
```
$ npm install
$ PORT=9999 ROS_WS_URL=ws://127.0.0.1:9090 node index.js
```

or using forever

```
$ PORT=9999 ROS_WS_URL=ws://127.0.0.1:9090 forever node index.js
```

* Reason of using ROS_WS_URL port, 9090
    * rosbridge default port is 9090. If you change the port, you should change the rosbrdige server port when it is launched.
