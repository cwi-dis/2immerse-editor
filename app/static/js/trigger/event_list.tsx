import * as React from "react";

import { Event } from "./trigger_client";
import EventContainer from "./event_container";

interface EventListProps {
  documentId: string;
  events: Array<Event>;
  fetchEvents?: () => void;
}

const EventList: React.SFC<EventListProps> = (props) => {
  const { documentId, events, fetchEvents } = props;

  return (
    <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center"}}>
      {events.map((event, i) => {
        return (
          <EventContainer key={`event.${i}`}
                          documentId={documentId}
                          event={event}
                          onTriggered={fetchEvents} />
        );
      })}
    </div>
  );
};

export default EventList;
