#
# Global settings for this instance of the backend service.
#
# Replace the URLs here for deployment, or for running local copies of everything.
#
layoutService = "https://layout-service-edge.platform.2immerse.eu/layout/v3"
websocketService = "https://websocket-service-edge.platform.2immerse.eu/"
timelineService = "https://timeline-service-edge.platform.2immerse.eu/timeline/v1"

clientApiUrl = "http://origin.platform.2immerse.eu/client-api/master/dist/test/general-test/dist/index.html"

noKibana = False
logLevel = 'DEBUG'

# Enable this (and fill in the right IP address) to run all services locally.
# DO NOT CHECK IN, please......
if False:
    layoutService = "http://flauwte.dis.cwi.nl:8000/layout/v3"
    websocketService = "http://flauwte.dis.cwi.nl:3000/"
    timelineService = "http://flauwte.dis.cwi.nl:8001/timeline/v1"
    noKibana=True
    logLevel = 'DEBUG'
