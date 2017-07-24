import * as React from "react";
import { Event, EventParams } from "./trigger_client";

interface EventContainerProps {
  event: Event;
}

class EventContainer extends React.Component<EventContainerProps, {}> {
  public render() {
    const { event } = this.props;

    return (
      <div style={{margin: "0 25px", padding: 25, borderBottom: "1px solid #555555"}}>
        <h3>{event.name}</h3>
        {event.parameters.map((event, i) => {
          return (
            <p key={i}>
              {event.name}; {event.parameter}; {event.type}
            </p>
          );
        })}
        <div className="level">
          <div className="level-left"></div>
          <div className="level-right">
            <div className="level-item">
              <button className="button is-info">Trigger</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EventContainer;