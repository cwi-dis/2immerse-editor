#
# Global settings for this instance of the backend service.
#
# Replace the URLs here for deployment, or for running local copies of everything.
#

# URL for the preview player:
clientApiUrl = "https://origin.platform.2immerse.eu/client-api/master/dist/test/general-test/dist/index.html"

# Mode in which the preview player runs (tv or standalone)
mode = "standalone"

# URLs for 2immerse services
layoutService = "https://layout-service-edge.platform.2immerse.eu/layout/v3"
websocketService = "https://websocket-service-edge.platform.2immerse.eu/"
timelineService = "https://timeline-service-edge.platform.2immerse.eu/timeline/v1"

# Logging parameters for the authoring service
noKibana = False
logLevel = 'werkzeug:WARN,INFO'

def _get():
    kList = [name for name in globals() if name[:1] != '_']
    rv = {}
    for k in kList:
        rv[k] = globals()[k]
    return rv
    
def _put(values):
    for k, v in values.items():
        globals()[k] = v
        
if __name__ == '__main__':
    print _get()
    _put({'noKibana':True})
    print _get()
    
