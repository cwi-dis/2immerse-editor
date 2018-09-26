from __future__ import print_function
#
# Global settings for this instance of the backend service.
#
# Replace the URLs here for running local copies of everything (or use the environment variables).
#
# When deployed to the 2immerse infrastructure with the Mantl stuff there will be
# environment variables that override the URLs
import os


class GlobalSettings(object):
    # URL for the preview player:
    clientApiUrl = os.getenv(
        "CLIENT_API_URL",
        "https://origin.platform.2immerse.eu/client-api/master/dist/test/general-test/dist/index.html"
    )

    # URLs for 2immerse services
    layoutService = os.getenv(
        "LAYOUT_SERVICE_URL",
        "https://layout-service.edge.platform.2immerse.eu/layout/v4"
    )
    websocketService = os.getenv(
        "WEBSOCKET_SERVICE_URL",
        "https://websocket-service.edge.platform.2immerse.eu/"
    )
    websocketInternalService = os.getenv(
        "WEBSOCKET_INTERNAL_SERVICE_URL",
        websocketService
    )
    timelineService = os.getenv(
        "TIMELINE_SERVICE_URL",
        "https://timeline-service.edge.platform.2immerse.eu/timeline/v1"
    )
    kibanaService = os.getenv(
        "KIBANA_SERVICE_URL",
        "https://platform.2immerse.eu/kibana/app/kibana"
    )

    # Mode in which the preview player runs (tv or standalone)
    mode = "standalone"

    # Logging parameters for the authoring service
    noKibana = (kibanaService == "")
    logLevel = 'werkzeug:WARN,INFO'


def _get():
    props = GlobalSettings.__dict__
    return {k: v for k, v in props.iteritems() if k[:1] != "_"}


def _put(values):
    for k, v in values.iteritems():
        setattr(GlobalSettings, k, v)

if __name__ == '__main__':
    print(_get())
    _put({'noKibana': True})
    print(_get())
