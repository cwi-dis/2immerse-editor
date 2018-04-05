import * as React from "react";
import * as classNames from "classnames";

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

  private paramCount() {
    const { event } = this.props;
    const count = event.parameters.filter((param) => param.type !== "set").length;

    if (count === 0) {
      return null;
    }

    return (
      <p>{count} parameter{(count === 1) ? "" : "s"}</p>
    );
  }

  public render() {
    const { event } = this.props;
    const { isLoading, flashSuccess, flashError } = this.state;

    const borderColor = (event.modify) ? "#23D160" : "#161616";
    const bgColor = (event.modify) ? "#0C4620" : "transparent";

    return (
      <div style={{display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: bgColor, width: 380, border: `1px solid ${borderColor}`, borderRadius: 5, boxShadow: "0 0 10px #161616", margin: 10, padding: 25}}>
        <div style={{display: "flex"}}>
          <div style={{width: 100, height: 100, margin: "0 15px 0 0", backgroundColor: "transparent"}}>
            {(event.previewUrl) && <img src={event.previewUrl} style={{maxWidth: 98, maxHeight: 98}} />}
          </div>
          <div>
            <h3 style={{color: "#E9E9E9"}}>{event.name}</h3>
            {(event.longdesc) && <p>{event.longdesc}</p>}
            {this.paramCount()}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className={classNames(
                              "button",
                              "is-info",
                              {"is-loading": isLoading, "button-pulse-success": flashSuccess, "button-pulse-error": flashError})}
                  onClick={() => this.setState({showEventModal: true})}
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
