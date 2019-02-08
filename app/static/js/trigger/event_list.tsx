/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import * as escapeStringRegex from "escape-string-regexp";

import { Event } from "./trigger_client";
import EventContainer from "./event_container";
import QueuedEventList from "./queued_event_list";

/**
 * Calculates the optimal width of the wrapper container hosting the individual
 * event blocks. Starting from the full screen width, it is decreased until an
 * exact multiple of the event block width is found, which is then returned as
 * the optimal width. If no such width could be found, the event block width is
 * returned.
 *
 * @param blockWidth The width of individual event blocks
 * @returns The optimal width for the container based on screen width
 */
const findOptimalContainerWidth = (blockWidth = 400) => {
  // Calculate optimal width of container based on width of event blocks
  for (let containerWidth = window.outerWidth; containerWidth >= blockWidth; containerWidth--) {
    if (containerWidth % blockWidth === 0) {
      return containerWidth;
    }
  }

  return blockWidth;
};

/**
 * Props for EventList
 */
interface EventListProps {
  documentId: string;
  events: Array<Event>;
  triggerMode: string;
  fetchEvents?: () => void;
}

/**
 * Renders a list of events by arranging them on a grid, where each event is
 * placed inside a box displaying event title, thumbnail and a button for
 * launching configuring the event. The exact events that are rendered from the
 * list passed in via props depends on the given trigger mode.
 *
 * @param documentId The document ID for the current session
 * @param events The list of events to be rendered
 * @param triggerMode The current trigger mode
 * @param fetchEvents Callback triggered when the event list should be updated
 */
const EventList: React.SFC<EventListProps> = (props) => {
  const { documentId, events, fetchEvents, triggerMode } = props;

  // Divide elements based on their type
  const abstractEvents = events.filter((ev) => ev.state === "abstract");
  const instantiatedEvents = events.filter((ev) => ev.state === "active");
  const readyEvents = events.filter((ev) => ev.state === "ready");

  let renderedEvents: Array<Event> = [];
  let queuedEvents: Array<Event> = [];

  if (triggerMode === "trigger") {
    // If we're in direct trigger mode, concat ready and abstract events
    renderedEvents = readyEvents.concat(abstractEvents).map((event) => {
      // Replace events which have and active version with that active version
      const eventRegex = RegExp(`^${escapeStringRegex(event.id)}-[0-9]+$`);
      const activeResult = instantiatedEvents.find((replacement) => {
        return eventRegex.test(replacement.id);
      });

      return activeResult || event;
    });
  } else {
    // If we're in queue mode, only render abstract events, put ready and instantiated
    // events in a different list
    renderedEvents = abstractEvents;
    queuedEvents = readyEvents.concat(instantiatedEvents);
  }

  // If we're in queue mode, render queued events in a bar on top, otherwise
  // simply render the events in their containers
  return (
    <div>
      {(triggerMode === "enqueue") ? <QueuedEventList events={queuedEvents} documentId={documentId} /> : null}
      <div style={{width: findOptimalContainerWidth(), margin: "0 auto"}}>
        <div style={{display: "flex", flexWrap: "wrap", justifyContent: "flex-start"}}>
          {renderedEvents.map((event, i) => {
            return (
              <EventContainer
                key={`event.${i}`}
                documentId={documentId}
                event={event}
                onTriggered={fetchEvents}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EventList;
