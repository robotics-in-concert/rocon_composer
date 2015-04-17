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

1. create `config.json`

  * example

```
{
  "port": 9999,
  "mongo_url": "mongodb://localhost:27017/rocon_composer",
  "rocon_protocols_webserver_address" : "http://localhost:10001",
  "log_level": "info",
  "service_repo_base": "eskim/test_ros_packages",
  "service_repo": "waypoint/test_ros_packages",
  "github_token": "e8da..."
}
```

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





### configuration

  - `port` : The port to run web interface.
  - `mongo_url` : mongodb connection URL (eg. mongodb://localhost:27017/rocon_authoring)
  - `rocon_protocols_webserver_address` : message database server address (eg. http://localhost:10000)
  - `log_level` : log level (default, `info`)
  - `service_repo_base` : base github service repository (eg. `eskim/test_ros_packages`)
  - `service_repo` : forked github service repository (eg. `waypoint/test_ros_packages`)
  - `github_token` : github access token to commit forked repository (Settings > Applications > Generate New Token)

<!--

#### Command line arguemtns

* `--web` : enable blockly web interface
* `--engine` : enable workflow engine
* `--workflow=workflow1 --workflow==workflow2 ...` : workflow names to load (force engine to start)

-->
