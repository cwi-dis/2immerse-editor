import * as React from "react";
import { Event, EventParams } from "./trigger_client";

function capitalize(str: string) {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
}

interface EventContainerProps {
  documentId: string;
  event: Event;
}

class EventContainer extends React.Component<EventContainerProps, {}> {
  private paramElements: Array<[string, HTMLInputElement]>;

  constructor(props: EventContainerProps) {
    super(props);
    this.paramElements = [];
  }

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
        <h3 style={{color: "#E9E9E9"}}>{event.name}</h3>

        <table className="table is-narrow" style={{width: "50%", margin: "20px 0 15px 0"}}>
          <tbody>
            {event.parameters.map((event, i) => {
              return (
                <tr key={i}>
                  <td style={{width: "50%", verticalAlign: "middle"}}>
                    {capitalize(event.name)}
                  </td>
                  <td style={{width: "50%"}}>
                    <input className="input is-info"
                           ref={(e) => this.paramElements.push([event.parameter, e])}
                           type="number"
                           defaultValue="0"
                           min="0" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

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
