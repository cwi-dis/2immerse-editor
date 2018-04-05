import * as React from "react";
import * as classNames from "classnames";

import { makeRequest } from "../editor/util";
import { Event } from "./trigger_client";
import EventModal from "./event_modal";

interface EventContainerProps {
  documentId: string;
  event: Event;
  onTriggered?: () => void;
}

interface EventContainerState {
  isLoading: boolean;
  flashSuccess: boolean;
  flashError: boolean;
  showEventModal: boolean;
}

class EventContainer extends React.Component<EventContainerProps, EventContainerState> {
  constructor(props: EventContainerProps) {
    super(props);

    this.state = {
      isLoading: false,
      flashSuccess: false,
      flashError: false,
      showEventModal: false
    };
  }

  private getButtonLabel(): string {
    const { event } = this.props;

    if (event.parameters.filter((param) => param.type !== "set").length > 0) {
      return "configure";
    } else if (event.verb) {
      return event.verb;
    } else if (event.modify) {
      return "modify";
    }

    return "show";
  }

  private renderEventModal() {
    if (!this.state.showEventModal) {
      return null;
    }

    return (
      <div className="modal is-active">
        <div className="modal-background"></div>
        <div className="modal-content">
          <EventModal event={this.props.event}
                      documentId={this.props.documentId}
                      onTriggered={(status) => {
                        this.setState({
                          showEventModal: false,
                          flashSuccess: status === "success",
                          flashError: status === "error"
                        });
                      }} />
        </div>
        <button className="modal-close is-large"
                onClick={() => this.setState({showEventModal: false})}>
        </button>
      </div>
    );
  }

  private launchEvent() {
    const { event, documentId } = this.props;

    const endpoint = event.modify ? "modify" : "trigger";
    const requestMethod = event.modify ? "PUT" : "POST";

    const url = `/api/v1/document/${documentId}/events/${event.id}/${endpoint}`;
    const data = JSON.stringify(event.parameters.map((param) => {
      return { parameter: param.parameter, value: param.value };
    }));

    console.log("Launching basic event at url", url, "with data", data);

    makeRequest(requestMethod, url, data, "application/json").then((data) => {
      console.log("success");
      this.setState({ flashSuccess: true});
    }).catch((err) => {
      console.log("error:", err);
      this.setState({ flashError: true});
    });
  }

  private renderParamCount(count: number) {
    if (count === 0) {
      return null;
    }

    return (
      <p style={{fontStyle: "italic"}}>{count} parameter{(count === 1) ? "" : "s"}</p>
    );
  }

  public render() {
    const { event } = this.props;
    const { isLoading, flashSuccess, flashError } = this.state;

    const paramCount = event.parameters.filter((param) => param.type !== "set").length;

    const borderColor = (event.modify) ? "#23D160" : "#161616";
    const bgColor = (event.modify) ? "#0C4620" : "transparent";

    const boxStyle: React.CSSProperties = {
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      width: 380,
      backgroundColor: bgColor, boxShadow: "0 0 10px #161616",
      border: `1px solid ${borderColor}`, borderRadius: 5,
      margin: 10, padding: 25
    };

    return (
      <div style={boxStyle}>
        <div style={{display: "flex"}}>
          <div style={{width: 100, height: 100, margin: "0 15px 0 0", backgroundColor: "transparent"}}>
            {(event.previewUrl) && <img src={event.previewUrl} style={{maxWidth: 98, maxHeight: 98}} />}
          </div>
          <div>
            <h3 style={{color: "#E9E9E9"}}>{event.name}</h3>
            {(event.longdesc) && <p>{event.longdesc}</p>}
            {this.renderParamCount(paramCount)}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className={classNames(
                              "button",
                              "is-info",
                              {"is-loading": isLoading, "button-pulse-success": flashSuccess, "button-pulse-error": flashError})}
                  onClick={() => (paramCount === 0) ? this.launchEvent() : this.setState({showEventModal: true})}
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
