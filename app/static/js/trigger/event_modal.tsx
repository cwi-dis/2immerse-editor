/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { List } from "immutable";

import { capitalize, makeRequest, Nullable } from "../editor/util";
import { Event, EventParams } from "./trigger_client";
import ParamInputField from "./param_input_field";

interface EventModalProps {
  event: Event;
  documentId: string;
  triggerMode: string;

  onTriggered: (status: "success" | "error" | "close") => void;
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
  private tableRef: Nullable<HTMLTableElement>;

  public constructor(props: EventModalProps) {
    super(props);

    this.state = {
      params: this.convertParams(props.event.parameters)
    };
  }

  public componentDidMount() {
    // Listen for all key presses
    window.onkeyup = (ev: KeyboardEvent) => {
      // Close modal if user presses ESC
      if (ev.which === 27) {
        console.log("ESC key pressed");
        this.props.onTriggered("close");
      } else if (ev.which === 13) {
        // Close modal and launch event is submit is enabled on ENTER
        console.log("enter key pressed");

        if (this.isSubmitEnabled()) {
          this.launchEvent();
        }
      }
    };

    if (this.tableRef) {
      // Focus input on first param entry field if present
      const firstInput = this.tableRef.querySelector("input");
      firstInput && firstInput.focus();
    }
  }

  private convertParams(parameters: Array<EventParams>) {
    // Map over params and convert them for display
    return List(parameters.map((param) => {
      // If param is undefined or null, replace it with default value
      param.value = param.value ? param.value : paramDefaults[param.type];

      // If param is a selection, set value property to first item
      if (param.type === "selection" && param.options) {
        param.value = param.options[0].value;
      }

      return param;
    }));
  }

  private collectParams(): List<{parameter: string, value: string}> {
    // Gather all params from state as key/value pairs for use in launchEvent()
    return this.state.params.map((param) => {
      return {
        parameter: param.parameter,
        value: param.value!
      };
    });
  }

  private async launchEvent() {
    const { event, documentId, onTriggered, triggerMode } = this.props;
    let endpoint: string, requestMethod: "PUT" | "POST";

    // Determine endpoint and request method based on trigger mode and modify flag
    if (triggerMode === "trigger") {
      endpoint = event.modify ? "modify" : "trigger";
      requestMethod = event.modify ? "PUT" : "POST";
    } else {
      endpoint = "enqueue";
      requestMethod = "POST";
    }

    // Compose URL and prepare request data
    const url = `/api/v1/document/${documentId}/events/${event.id}/${endpoint}`;
    const data = JSON.stringify(this.collectParams());

    console.log("Launching event at url", url, "with data", data);

    try {
      // Launch request and invoke onTriggered callback with success param
      await makeRequest(requestMethod, url, data, "application/json");
      console.log("success");
      onTriggered("success");
    } catch (err) {
      // Invoke onTriggered callback with error param
      console.log("error:", err);
      onTriggered("error");
    }
  }

  private updateParamField(i: number, ev: React.ChangeEvent<HTMLInputElement>) {
    // Get current value of param at index i and update it
    let currentValue = this.state.params.get(i)!;
    currentValue.value = ev.target.value;

    // Update state with new value
    this.setState({
      params: this.state.params.set(i, currentValue)
    });
  }

  private renderParamTable() {
    const { params } = this.state;

    // Render nothing if there are no params
    if (params.count() > 0) {
      return (
        <table ref={(el) => this.tableRef = el} className="table is-narrow" style={{width: "100%", margin: "20px 0 15px 0"}}>
          <tbody>
            {params.map((param, i) => {
              // Don't render param if it's of type 'set'
              if (param.type === "set") {
                return;
              }

              // Capitalise param name and render input field for it
              return (
                <tr key={i}>
                  <td style={{minWidth: "25%", verticalAlign: "middle", border: "none", color: "#000000"}}>
                    {capitalize(param.name)}
                  </td>
                  <td style={{maxWidth: "75%", border: "none"}}>
                    <ParamInputField
                      {...param}
                      onChange={this.updateParamField.bind(this, i)}
                    />
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
    const { event, triggerMode } = this.props;

    if (triggerMode === "enqueue") {
      return "enqueue";
    }

    // If we're in direct trigger mode, either render verb from event or 'modify'
    if (event.verb) {
      return event.verb;
    } else if (event.modify) {
      return "modify";
    }

    return "trigger";
  }

  private isSubmitEnabled(): boolean {
    const { params } = this.state;
    // Check whether all required params have a value
    const submitEnabled = params.filter((p) => p.required)
                                .every((p) => p.value !== undefined && p.value !== "");

    return submitEnabled;
  }

  public render() {
    // Render event name, table of params and submit button
    return (
      <div className="box">
        <h3 style={{color: "#555555", borderBottom: "1px solid #E2E2E2", paddingBottom: 10}}>{this.props.event.name}</h3>
        {this.renderParamTable()}
        <br />
        <button
          className="button is-info"
          onClick={this.launchEvent.bind(this)}
          disabled={!this.isSubmitEnabled()}
        >
          {this.getButtonLabel()}
        </button>
      </div>
    );
  }
}

export default EventModal;
