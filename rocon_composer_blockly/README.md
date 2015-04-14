rocon_composer_blockly
======================

## Pre-requisites




### Required Package


```
sudo apt-get install -y git build-essential g++ libxml2-dev
```

### Install node / npm

* install ndoejs

	```
	# Setup nodesource repository
	curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -

	# Then install
	sudo apt-get install -y nodejs
	```

* upgrade npm

	```
	$ sudo npm install npm -g

	# Check npm version is 2.x.x
	$ npm -v
	```



### Install mongodb

```
$ sudo apt-get install -y mongodb

# check if mongo is running
$ sudo status mongodb
mongodb start/running, process 12406
```


## Installation

* fetch repository

```
cd $PROJECT_PATH
git clone https://github.com/robotics-in-concert/rocon_composer.git
```

* install dependencies

```
cd $PROJECT_PATH/rocon_composer/rocon_composer_blockly
npm install
```


## Run

1. set environment variables below

<!--
export ROCON_COMPOSER_BLOCKLY_SERVER_PORT=9999
export ROCON_COMPOSER_BLOCKLY_ROSBRIDGE_URL=ws://127.0.0.1:9090
export ROCON_COMPOSER_BLOCKLY_MONGO_URL=mongodb://localhost:27017/rocon_authoring
export MSG_DATABASE=http://localhost:10000
export ROCON_COMPOSER_BLOCKLY_DELAY_AFTER_TOPICS=2000
export ROCON_COMPOSER_BLOCKLY_PUBLISH_DELAY=100
export ROCON_COMPOSER_BLOCKLY_LOG_LEVEL=info
-->

2. `node rocon_composer_blockly.js`


### Required Environment Variables

  - `ROCON_COMPOSER_BLOCKLY_SERVER_PORT` : The port to run web interface.
  - `ROCON_COMPOSER_BLOCKLY_MONGO_URL` : mongodb connection URL (eg. mongodb://localhost:27017/rocon_authoring)
  - `ROCON_COMPOSER_BLOCKLY_ENGINE_SOCKET_URL` : workflow engine's websocket url
  - `MSG_DATABASE` : message database server address (eg. http://localhost:10000)
  - `ROCON_COMPOSER_BLOCKLY_LOG_LEVEL` : log level (default, `info`)
  - `ROCON_COMPOSER_BLOCKLY_SERVICE_REPO_BASE` : base github service repository (eg. `eskim/test_ros_packages`)
  - `ROCON_COMPOSER_BLOCKLY_SERVICE_REPO` : forked github service repository (eg. `waypoint/test_ros_packages`)
  - `ROCON_COMPOSER_BLOCKLY_GITHUB_TOKEN` : github access token to commit forked repository (Settings > Applications > Generate New Token)

<!--

#### Command line arguemtns

* `--web` : enable blockly web interface
* `--engine` : enable workflow engine
* `--workflow=workflow1 --workflow==workflow2 ...` : workflow names to load (force engine to start)

-->
