import * as React from "react";

import { Event } from "./trigger_client";

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


const QueuedEventContainer: React.SFC<{ event: Event }> = (props) => {
  const { event } = props;

  const containerStyle: React.CSSProperties = {
    margin: "10px 5px", padding: 9,
    backgroundColor: bgColors[event.state],
    boxShadow: "0 0 10px #161616",
    border: `1px solid ${borderColors[event.state]}`,
    borderRadius: 5
  };

  return (
    <div style={containerStyle}>
      {event.name} ({event.state})
    </div>
  );
};

interface QueuedEventListProps {
  events: Array<Event>;
}

class QueuedEventList extends React.Component<QueuedEventListProps, {}> {
  public render() {
    const { events } = this.props;
    const activeEvents = events.filter((event) => event.state === "active");

    const queuedEvents = events.filter((event) => {
      return event.state === "ready";
    }).map((event) => {
      return activeEvents.find((active) => {
        return active.productionId === event.productionId;
      }) || event;
    });

    return (
      <div style={{display: "flex", flexDirection: "row", width: "100vw", height: 65, borderBottom: "2px solid #161616", padding: "0 5px"}}>
        {queuedEvents.map((event, i) => {
          return <QueuedEventContainer key={i} event={event} />;
        })}
      </div>
    );
  }
}

export default QueuedEventList;
