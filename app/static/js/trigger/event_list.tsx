import * as React from "react";

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
  for (let containerWidth = window.outerWidth; containerWidth >= blockWidth; containerWidth--) {
    if (containerWidth % blockWidth === 0) {
      return containerWidth;
    }
  }

  return blockWidth;
};

const EventList: React.SFC<EventListProps> = (props) => {
  const { documentId, events, fetchEvents, triggerMode } = props;

  const abstractEvents = events.filter((ev) => ev.state === "abstract");
  const instantiatedEvents = events.filter((ev) => ev.state === "active");
  const readyEvents = events.filter((ev) => ev.state === "ready");

  let renderedEvents: Array<Event> = [];
  let queuedEvents: Array<Event> = [];

  if (triggerMode === "trigger") {
    renderedEvents = readyEvents.concat(abstractEvents).map((event) => {
      const activeResult = instantiatedEvents.find((replacement) => {
        return replacement.productionId === event.productionId;
      });

      return activeResult || event;
    });
  } else {
    renderedEvents = abstractEvents;
    queuedEvents = readyEvents.concat(instantiatedEvents);
  }

  return (
    <div>
      {(triggerMode === "enqueue") ? <QueuedEventList events={queuedEvents} /> : null}
      <div style={{width: findOptimalContainerWidth(), margin: "0 auto"}}>
        <div style={{display: "flex", flexWrap: "wrap", justifyContent: "flex-start"}}>
          {renderedEvents.map((event, i) => {
            return (
              <EventContainer key={`event.${i}`}
                              documentId={documentId}
                              event={event}
                              onTriggered={fetchEvents} />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EventList;
