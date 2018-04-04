import * as React from "react";
import { List } from "immutable";

import { capitalize, makeRequest } from "../editor/util";
import { Event, EventParams } from "./trigger_client";
import ParamInputField from "./param_input_field";

interface EventModalProps {
  event: Event;
  documentId: string;

  onTriggered: (status: "success" | "error") => void;
}

interface EventModalState {
  params: List<EventParams>;
}

const paramDefaults: {[key: string]: string} = {
  duration: "0",
  time: "0",
  string: "",
  url: ""
};

class EventModal extends React.Component<EventModalProps, EventModalState> {
  public constructor(props: EventModalProps) {
    super(props);

    this.state = {
      params: this.convertParams(props.event.parameters)
    };
  }

  private convertParams(parameters: Array<EventParams>) {
    return List(parameters.map((param) => {
      param.value = param.value ? param.value : paramDefaults[param.type];

      if (param.type === "selection" && param.options) {
        param.value = param.options[0].value;
      }

      return param;
    }));
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
    const { event, documentId, onTriggered } = this.props;

    const endpoint = event.modify ? "modify" : "trigger";
    const requestMethod = event.modify ? "PUT" : "POST";

    const url = `/api/v1/document/${documentId}/events/${event.id}/${endpoint}`;
    const data = JSON.stringify(this.collectParams());

    console.log("Launching event at url", url, "with data", data);

    makeRequest(requestMethod, url, data, "application/json").then((data) => {
      console.log("success");
      onTriggered("success");
    }).catch((err) => {
      console.log("error:", err);
      onTriggered("error");
    });
  }

  private updateParamField(i: number, ev: React.ChangeEvent<HTMLInputElement>) {
    let currentValue = this.state.params.get(i)!;
    currentValue.value = ev.target.value;

    this.setState({
      params: this.state.params.set(i, currentValue)
    });
  }

  private renderParamTable() {
    const { params } = this.state;

    if (params.count() > 0) {
      return (
        <table className="table is-narrow" style={{margin: "20px 0 15px 0"}}>
          <tbody>
            {params.map((param, i) => {
              if (param.type === "set") {
                return;
              }

              return (
                <tr key={i}>
                  <td style={{width: "20%", verticalAlign: "middle", border: "none", color: "#000000"}}>
                    {capitalize(param.name)}
                  </td>
                  <td style={{width: "80%", border: "none"}}>
                    <ParamInputField {...param}
                                     onChange={this.updateParamField.bind(this, i)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
  }

  private getButtonLabel(): string {
    const { event } = this.props;

    if (event.verb) {
      return event.verb;
    } else if (event.modify) {
      return "Modify";
    }

    return "Trigger";
  }

  public render() {
    const { params } = this.state;
    const submitEnabled = params.filter((p) => p.required)
                                .every((p) => p.value !== undefined && p.value !== "");

    if (params.filter((param) => param.type !== "set").count() === 0) {
      this.launchEvent();
      return null;
    }

    return (
      <div className="box">
        <h3 style={{color: "#555555", borderBottom: "1px solid #E2E2E2", paddingBottom: 10}}>{this.props.event.name}</h3>
        {this.renderParamTable()}
        <br/>
        <button className="button is-info"
                onClick={this.launchEvent.bind(this)}
                disabled={!submitEnabled}>{this.getButtonLabel()}</button>
      </div>
    );
  }
}

export default EventModal;
