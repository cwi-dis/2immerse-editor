import * as React from "react";
import * as classNames from "classnames";
import { List } from "immutable";

import { capitalize, makeRequest } from "../editor/util";
import { Event, EventParams } from "./trigger_client";
import ParamInputField from "./param_input_field";
import EventModal from "./utils/event_modal";

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
  showEventModal: boolean;
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
      params: this.convertParams(props.event.parameters),
      showEventModal: false
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

  private getButtonLabel(): string {
    const { event } = this.props;

    if (event.verb) {
      return event.verb;
    } else if (event.modify) {
      return "Modify";
    }

    return "Trigger";
  }

  private renderEventModal() {
    if (!this.state.showEventModal) {
      return null;
    }

    return (
      <div className="modal is-active">
        <div className="modal-background"></div>
        <div className="modal-content">
          <EventModal event={this.props.event} />
        </div>
        <button className="modal-close is-large"
                onClick={() => this.setState({showEventModal: false})}>
        </button>
      </div>
    );
  }

  private renderParamTable() {
    const { params } = this.state;

    if (params.count() > 0) {
      return (
        <table className="table is-narrow" style={{width: "80%", margin: "20px 0 15px 0"}}>
          <tbody>
            {params.map((param, i) => {
              if (param.type === "set") {
                return;
              }

              return (
                <tr key={i}>
                  <td style={{width: "50%", verticalAlign: "middle", border: "none"}}>
                    {capitalize(param.name)}
                  </td>
                  <td style={{width: "50%", border: "none"}}>
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

  public render() {
    const { event } = this.props;
    const { params, isLoading, flashSuccess, flashError } = this.state;

    const submitEnabled = params.filter((p) => p.required)
                                .every((p) => p.value !== undefined && p.value !== "");

    return (
      <div style={{width: 400, border: "1px solid #161616", borderRadius: 5, boxShadow: "0 0 10px #161616", margin: "10px 25px 5px 25px", padding: 25}}>
        <div style={{display: "flex"}}>
          <div style={{width: 100, height: 100, margin: "0 15px 0 0"}}>
            {(event.previewUrl) && <img src={event.previewUrl} style={{maxWidth: 98, maxHeight: 98}} />}
          </div>
          <div>
            <h3 style={{color: "#E9E9E9"}}>{event.name}</h3>
            {(event.longdesc) && <p>{event.longdesc}</p>}
            {this.renderParamTable()}
          </div>
        </div>

        <div>
          <button className={classNames(
                              "button",
                              "is-info",
                              {"is-loading": isLoading, "button-pulse-success": flashSuccess, "button-pulse-error": flashError})}
                  onClick={() => (params.count() === 0) ? this.launchEvent.bind(this) : this.setState({showEventModal: true})}
                  onAnimationEnd={() => this.setState({flashSuccess: false, flashError: false})}>
            {this.getButtonLabel()}
          </button>
        </div>
        {this.renderEventModal()}
      </div>
    );
  }
}

export default EventContainer;
