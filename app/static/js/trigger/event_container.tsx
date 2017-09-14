import * as React from "react";
import * as classNames from "classnames";
import { List } from "immutable";

import { capitalize, makeRequest } from "../editor/util";
import { Event, EventParams } from "./trigger_client";
import ParamInputField from "./param_input_field";

interface EventContainerProps {
  documentId: string;
  event: Event;
  onTriggered?: () => void;
}

interface EventContainerState {
  isLoading: boolean;
  flashSuccess: boolean;
  flashError: boolean;
  params: List<EventParams>;
}

const paramDefaults: {[key: string]: string} = {
  duration: "0",
  time: "0",
  string: "",
  url: ""
};

class EventContainer extends React.Component<EventContainerProps, EventContainerState> {
  constructor(props: EventContainerProps) {
    super(props);

    this.state = {
      isLoading: false,
      flashSuccess: false,
      flashError: false,
      params: List(props.event.parameters.map((param) => {
        param.value = param.value ? param.value : paramDefaults[param.type];
        return param;
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
    return this.state.params.map((param) => {
      return {
        parameter: param.parameter,
        value: param.value!
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
    this.setState({
      isLoading: true
    });

    makeRequest(requestMethod, url, data, "application/json").then((data) => {
      console.log("success");

      this.setState({
        isLoading: false,
        flashSuccess: true
      });

      this.props.onTriggered && this.props.onTriggered();
    }).catch((err) => {
      console.log("error:", err);

      this.setState({
        isLoading: false,
        flashError: true
      });
    });
  }

  private updateParamField(i: number, ev: React.ChangeEvent<HTMLInputElement>) {
    let currentValue = this.state.params.get(i)!;
    currentValue.value = ev.target.value;

    this.setState({
      params: this.state.params.set(i, currentValue)
    });
  }

  public render() {
    const { event } = this.props;
    const { params, isLoading, flashSuccess, flashError } = this.state;

    return (
      <div style={{display: "flex", margin: "10px 25px 0 25px", padding: 25, borderBottom: "1px solid #555555"}}>
        <div style={{width: 100, height: 100, margin: "0 15px 0 0", border: "1px solid #555555", backgroundColor: "#222222"}}>
          {(event.previewUrl) && <img src={event.previewUrl} style={{maxWidth: 98, maxHeight: 98}} />}
        </div>
        <div style={{flexGrow: 1}}>
          <h3 style={{color: "#E9E9E9"}}>{event.name}</h3>
          {(event.longdesc) && <p>{event.longdesc}</p>}

          <table className="table is-narrow" style={{width: "50%", margin: "20px 0 15px 0"}}>
            <tbody>
              {params.map((param, i) => {
                return (
                  <tr key={i}>
                    <td style={{width: "50%", verticalAlign: "middle"}}>
                      {capitalize(param.name)}
                    </td>
                    <td style={{width: "50%"}}>
                      <ParamInputField type={param.type}
                                      value={params.get(i)!.value!}
                                      onChange={this.updateParamField.bind(this, i)} />
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
                <button className={classNames(
                                    "button",
                                    "is-info",
                                    {"is-loading": isLoading, "button-pulse-success": flashSuccess, "button-pulse-error": flashError})}
                        onClick={this.launchEvent.bind(this)}
                        onAnimationEnd={() => this.setState({flashSuccess: false, flashError: false})}>
                  {event.modify ? "Modify" : "Trigger"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EventContainer;
