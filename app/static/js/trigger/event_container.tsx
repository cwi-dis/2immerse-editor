import * as React from "react";
import { List } from "immutable";

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

interface EventContainerState {
  params: List<[string, string | undefined]>;
}

class EventContainer extends React.Component<EventContainerProps, EventContainerState> {
  constructor(props: EventContainerProps) {
    super(props);

    this.state = {
      params: List(props.event.parameters.map<[string, string | undefined]>((param) => {
        return [param.parameter, param.value];
      }))
    };
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

  private collectParams(): List<{parameter: string, value: string}> {
    return this.state.params.map(([param, value]) => {
      return {
        parameter: param,
        value: value!
      };
    });
  }

  private launchEvent() {
    const { event, documentId } = this.props;

    const endpoint = event.modify ? "modify" : "trigger";
    const requestMethod = event.modify ? "PUT" : "POST";

    const url = `/api/v1/document/${documentId}/events/${event.id}/${endpoint}`;
    const data = JSON.stringify(this.collectParams());

    console.log("Launching event at url", url, "with data", data);

    makeRequest(requestMethod, url, data, "application/json").then((data) => {
      console.log("success");
      this.props.onTriggered && this.props.onTriggered();
    }).catch((err) => {
      console.log("error:", err);
    });
  }

  private updateParamField(i: number, ev: React.ChangeEvent<HTMLInputElement>) {
    let currentValue = this.state.params.get(i)!;
    currentValue[1] = ev.target.value;

    this.setState({
      params: this.state.params.set(i, currentValue)
    });
  }

  private renderInputField(params: EventParams, i: number): JSX.Element | null {
    switch (params.type) {
    case "duration":
    case "time":
      return <input className="input is-info"
                    onChange={this.updateParamField.bind(this, i)}
                    type="number"
                    value={this.state.params.get(i)![1] || "0"}
                    min="0" />;
    case "string":
      return <input className="input is-info"
                    onChange={this.updateParamField.bind(this, i)}
                    value={this.state.params.get(i)![1] || ""}
                    type="text" />;
    case "url":
      return <input className="input is-info"
                    onChange={this.updateParamField.bind(this, i)}
                    value={this.state.params.get(i)![1] || ""}
                    type="url" />;
    case "const":
      return <input className="input"
                    defaultValue={this.state.params.get(i)![1]}
                    type="string"
                    disabled />;
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
                    {this.renderInputField(params, i)}
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
              <button className="button is-info" onClick={this.launchEvent.bind(this)}>
                {event.modify ? "Modify" : "Trigger"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EventContainer;
