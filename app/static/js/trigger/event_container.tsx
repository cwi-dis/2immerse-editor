import * as React from "react";

import { makeRequest } from "../editor/util";
import { Event, EventParams } from "./trigger_client";

function capitalize(str: string) {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
}

interface EventContainerProps {
  documentId: string;
  event: Event;
  onTriggered?: () => void;
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

  private collectParams(): Array<{parameter: string, value: string}> {
    this.paramElements = this.paramElements.filter(([_, el]) => el !== null);

    return this.paramElements.map(([param, el]) => {
      return {
        parameter: param,
        value: el.value
      };
    });
  }

  private launchEvent() {
    const { event, documentId } = this.props;

    const url = `/api/v1/document/${documentId}/events/${event.id}/trigger`;
    const data = JSON.stringify(this.collectParams());

    console.log("Launching event at url", url, "with data", data);

    makeRequest("POST", url, data, "application/json").then((data) => {
      console.log("success");
      this.props.onTriggered && this.props.onTriggered();
    }).catch((err) => {
      console.log("error:", err);
    });
  }

  private renderInputField(params: EventParams): JSX.Element | null {
    switch (params.type) {
    case "duration":
    case "time":
      return <input className="input is-info"
                    ref={(e) => this.paramElements.push([params.parameter, e])}
                    type="number"
                    defaultValue="0"
                    min="0" />;
    case "string":
      return <input className="input is-info"
                    ref={(e) => this.paramElements.push([params.parameter, e])}
                    type="text" />;
    case "url":
      return <input className="input is-info"
                    ref={(e) => this.paramElements.push([params.parameter, e])}
                    type="url" />;
    case "const":
      return <b>{params.value}</b>;
    default:
      return null;
    }
  }

  public render() {
    const { event } = this.props;

    return (
      <div style={{margin: "10px 25px 0 25px", padding: 25, borderBottom: "1px solid #555555"}}>
        <h3 style={{color: "#E9E9E9"}}>{event.name}</h3>

        <table className="table is-narrow" style={{width: "50%", margin: "20px 0 15px 0"}}>
          <tbody>
            {event.parameters.map((params, i) => {
              return (
                <tr key={i}>
                  <td style={{width: "50%", verticalAlign: "middle"}}>
                    {capitalize(params.name)}
                  </td>
                  <td style={{width: "50%"}}>
                    {this.renderInputField(params)}
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
              <button className="button is-info" onClick={this.launchEvent.bind(this)}>Trigger</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EventContainer;
