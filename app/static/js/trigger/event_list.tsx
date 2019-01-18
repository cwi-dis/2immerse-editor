import * as React from "react";
import * as escapeStringRegex from "escape-string-regexp";

import { Event } from "./trigger_client";
import EventContainer from "./event_container";
import QueuedEventList from "./queued_event_list";

interface EventListProps {
  documentId: string;
  events: Array<Event>;
  triggerMode: string;
  fetchEvents?: () => void;
}

const findOptimalContainerWidth = (blockWidth = 400) => {
  // Calculate optimal width of container based on width of event blocks
  for (let containerWidth = window.outerWidth; containerWidth >= blockWidth; containerWidth--) {
    if (containerWidth % blockWidth === 0) {
      return containerWidth;
    }
  }

  return blockWidth;
};

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
