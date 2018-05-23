import * as React from "react";

import { Event } from "./trigger_client";
import { makeRequest } from "../editor/util";

interface QueuedEventContainerProps {
  documentId: string;
  event: Event;
}

const QueuedEventContainer: React.SFC<QueuedEventContainerProps> = (props) => {
  const { event, documentId } = props;

  const colors: { [key: string]: [string, string] } = {
    "abstract": ["#161616", "transparent"],
    "ready": ["#C95A26", "#795341"],
    "active": ["#23D160", "#0C4620"]
  };

  const [borderColor, bgColor] = colors[event.state];
  const containerStyle: React.CSSProperties = {
    border: `1px solid ${borderColor}`,
    backgroundColor: bgColor,
    float: "left"
  };

  const dequeueEvent = () => {
    console.log("Dequeueing event", event.id);
    const url = `/api/v1/document/${documentId}/events/${event.id}/dequeue`;

    makeRequest("POST", url).then(() => {
      console.log("Event dequeued successfully");
    }).catch((err) => {
      console.error("Could not dequeue event", err);
    });
  };

  return (
    <div className="queued-event-container" style={containerStyle}>
      {(event.state === "active") ? null : <span onClick={dequeueEvent}>&times;</span>}
      {event.name}
    </div>
  );
};

interface QueuedEventListProps {
  documentId: string;
  events: Array<Event>;
}

const QueuedEventList: React.SFC<QueuedEventListProps> = (props) => {
  const { events, documentId } = props;
  const activeEvents = events.filter((event) => event.state === "active");

  const queuedEvents = events.filter((event) => {
    return event.state === "ready";
  }).map((event) => {
    return activeEvents.find((active) => active.productionId === event.productionId) || event;
  });

  return (
    <div className="queued-event-list">
      {queuedEvents.map((event, i) => {
        return <QueuedEventContainer key={i} event={event} documentId={documentId} />;
      })}
    </div>
  );
};

export default QueuedEventList;
