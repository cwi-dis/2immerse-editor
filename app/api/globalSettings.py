"""Copyright 2018 Centrum Wiskunde & Informatica

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""
from __future__ import print_function
from __future__ import unicode_literals
#
# Global settings for this instance of the backend service.
#
# Replace the URLs here for running local copies of everything (or use the
# environment variables).
#
# When deployed to the 2immerse infrastructure with the Mantl stuff there will
# be environment variables that override the URLs
from builtins import object
import os


class GlobalSettings(object):
    # URL for the preview player:
    clientApiUrl = os.getenv(
        "CLIENT_API_URL",
        None
    )

    # URLs for 2immerse services
    layoutService = os.getenv(
        "LAYOUT_SERVICE_URL",
        None
    )
    websocketService = os.getenv(
        "WEBSOCKET_SERVICE_URL",
        None
    )
    websocketInternalService = os.getenv(
        "WEBSOCKET_INTERNAL_SERVICE_URL",
        websocketService
    )
    timelineService = os.getenv(
        "TIMELINE_SERVICE_URL",
        None
    )
    kibanaService = os.getenv(
        "KIBANA_SERVICE_URL",
        None
    )

    # Mode in which the preview player runs (tv or standalone)
    mode = "standalone"

    # Logging parameters for the authoring service
    noKibana = (kibanaService == "")
    logLevel = os.getenv(
        "LOGLEVEL",
        'werkzeug:WARN,INFO'
        )


def _get():
    props = GlobalSettings.__dict__
    return {k: v for k, v in list(props.items()) if k[:1] != "_"}


def _put(values):
    for k, v in list(values.items()):
        setattr(GlobalSettings, k, v)

if __name__ == '__main__':
    print(_get())
    _put({'noKibana': True})
    print(_get())
