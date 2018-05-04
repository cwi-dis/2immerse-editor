import * as React from "react";

import { Event } from "./trigger_client";
import { makeRequest } from "../editor/util";

const borderColors = {
  "abstract": "#161616",
  "ready": "#C95A26",
  "active": "#23D160"
};

const bgColors = {
  "abstract": "transparent",
  "ready": "#795341",
  "active": "#0C4620"
};


const QueuedEventContainer: React.SFC<{ event: Event, documentId: string }> = (props) => {
  const { event, documentId } = props;

  const containerStyle: React.CSSProperties = {
    backgroundColor: bgColors[event.state],
    border: `1px solid ${borderColors[event.state]}`,
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
      <span onClick={dequeueEvent}>&times;</span>
      {event.name}
    </div>
  );
};

interface QueuedEventListProps {
  documentId: string;
  events: Array<Event>;
}

class QueuedEventList extends React.Component<QueuedEventListProps, {}> {
  public render() {
    const { events, documentId } = this.props;
    const activeEvents = events.filter((event) => event.state === "active");

    const queuedEvents = events.filter((event) => {
      return event.state === "ready";
    }).map((event) => {
      return activeEvents.find((active) => {
        return active.productionId === event.productionId;
      }) || event;
    });

    return (
      <div className="queued-event-list">
        {queuedEvents.map((event, i) => {
          return <QueuedEventContainer key={i} event={event} documentId={documentId} />;
        })}
      </div>
    );
  }
}

export default QueuedEventList;
