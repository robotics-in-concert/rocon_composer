# Set some sane defaults for the rocon_authoring launch environment
##Documentation:
# The colon command simply has its arguments evaluated and then succeeds.
# It is the original shell comment notation (before '#' to end of line). For a long time, Bourne shell scripts had a colon as the first character.
# The C Shell would read a script and use the first character to determine whether it was for the C Shell (a '#' hash) or the Bourne shell (a ':' colon).
# Then the kernel got in on the act and added support for '#!/path/to/program' and the Bourne shell got '#' comments, and the colon convention went by the wayside.
# But if you come across a script that starts with a colon (Like this one), now you will know why. ~ Jonathan Leffler

: ${ROCON_AUTHORING_MONGO_URL:=mongodb://localhost:27017/cento_authoring}
: ${ROCON_AUTHORING_SERVER_PORT:=9999}
: ${ROCON_AUTHORING_ROSBRIDGE_URL:=ws://localhost:9090}
: ${ROCON_AUTHORING_DELAY_AFTER_TOPICS:=2000}
: ${ROCON_AUTHORING_PUBLISH_DELAY:=100}


#Exports
export ROCON_AUTHORING_MONGO_URL
export ROCON_AUTHORING_SERVER_PORT
export ROCON_AUTHORING_ROSBRIDGE_URL
export ROCON_AUTHORING_DELAY_AFTER_TOPICS
export ROCON_AUTHORING_PUBLISH_DELAY

