import * as React from "react";
import { Event, EventParams } from "./trigger_client";

interface EventContainerProps {
  event: Event;
}

class EventContainer extends React.Component<EventContainerProps, {}> {
  private paramElements: Array<HTMLInputElement>;

  private countParams(): string {
    const { parameters } = this.props.event;

    if (parameters.length === 0) {
      return "No parameters";
    } else if (parameters.length === 1) {
      return "1 parameter";
    }

    return `${parameters.length} parameters`;
  }

  public render() {
    const { event } = this.props;

    return (
      <div style={{margin: "10px 25px 0 25px", padding: 25, borderBottom: "1px solid #555555"}}>
        <h3>{event.name}</h3>
        {event.parameters.map((event, i) => {
          return (
            <p key={i}>
              {event.name}; {event.parameter}; {event.type}
            </p>
          );
        })}
        <div className="level">
          <div className="level-left">
            <p className="level-item" style={{color: "#999999", fontStyle: "italic", fontSize: 14}}>
              {(event.modify) ? "Modifiable. " : ""}
              {this.countParams()}
            </p>
          </div>
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
