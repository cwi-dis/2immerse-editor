import * as React from "react";

import { Event } from "./trigger_client";
import EventContainer from "./event_container";

interface EventListProps {
  documentId: string;
  events: Array<Event>;
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
  const { documentId, events, fetchEvents } = props;

  return (
    <div style={{width: findOptimalContainerWidth(), margin: "0 auto"}}>
      <div style={{display: "flex", flexWrap: "wrap", justifyContent: "flex-start"}}>
        {events.map((event, i) => {
          return (
            <EventContainer key={`event.${i}`}
                            documentId={documentId}
                            event={event}
                            onTriggered={fetchEvents} />
          );
        })}
      </div>
    </div>
  );
};

export default EventList;
