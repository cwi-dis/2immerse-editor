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
import { createPortal } from "react-dom";
import * as classNames from "classnames";

import { makeRequest } from "../editor/util";
import { Event } from "./trigger_client";
import EventModal from "./event_modal";
import { TriggerModeContext } from "./app";

/**
 * Props for EventContainer
 */
interface EventContainerProps {
  documentId: string;
  event: Event;
  onTriggered?: () => void;
}

/**
 * State for EventContainer
 */
interface EventContainerState {
  isLoading: boolean;
  flashSuccess: boolean;
  flashError: boolean;
  showEventModal: boolean;
}

/**
 * This component renders a given event as a box on screen. It displays title,
 * description, number of parameters and, depending on trigger mode and number
 * of parameters a button to either launch the event directly or to open a modal
 * dialogue which allows the user to configure event parameters and then either
 * launch or enqueue it.
 *
 * @param documentId The document ID for the current session
 * @param event The event to be rendered
 * @param onTriggered A callback invoked when the event has been triggered
 */
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

  /**
   * Returns the label to be put on the launch button of the event. The label
   * depends on whether the event has any parameters, on the `triggerMode`,
   * flags in the event itself or the `verb` field of the event if it is set.
   *
   * @param triggerMode The current trigger mode. Defaults to `trigger`
   * @returns The label for the submit button
   */
  private getButtonLabel(triggerMode = "trigger"): string {
    const { event } = this.props;

    // Return 'configure' if the event has any params which need to be set
    if (event.parameters.filter((param) => param.type !== "set").length > 0) {
      return "configure";
    } else if (triggerMode === "enqueue") {
      // Return enqueue if trigger mode is 'enqueue'
      return "enqueue";
    } else if (event.verb) {
      // Otherwise render the verb contained in the event itelf
      return event.verb;
    } else if (event.modify) {
      // Return 'modify' if the modify flag is set
      return "modify";
    }

    // By default return 'show'
    return "show";
  }

  /**
   * Renders a modal dialogue for the current event and attaches it to the
   * DOM element `modal-root` through a portal. Whether the modal is rendereed
   * or not, depends on the value of the `showEventModal` state variable.
   *
   * @returns A portal to the event modal or `null`
   */
  private renderEventModal() {
    // Render nothing if showEventModal is false
    if (!this.state.showEventModal) {
      return null;
    }

    // Create modal using a portal and render event params
    return createPortal(
      <div className="modal is-active">
        <div className="modal-background" />
        <div className="modal-content">
          <TriggerModeContext.Consumer>
            {(triggerMode) =>
              <EventModal
                event={this.props.event}
                documentId={this.props.documentId}
                triggerMode={triggerMode}
                onTriggered={(status) => {
                  this.setState({
                    showEventModal: false,
                    flashSuccess: status === "success",
                    flashError: status === "error"
                  });

                  this.props.onTriggered && this.props.onTriggered();
                }}
              />
            }
          </TriggerModeContext.Consumer>
        </div>
        <button
          className="modal-close is-large"
          onClick={() => this.setState({showEventModal: false})}
        />
      </div>,
      document.getElementById("modal-root")!
    );
  }

  /**
   * Callback invoked in response to the user clicking the submit button. Based
   * on the given `triggerMode`, a different URL is composed which is then used
   * to trigger the event with the given params. Invokes the `onTriggered`
   * callback with either the argument `success` or `error` after the request
   * has completed and updates the state accordingly.
   *
   * @param triggerMode The current trigger mode. Defaults to `trigger`
   */
  private async launchEvent(triggerMode = "trigger") {
    const { event, documentId } = this.props;
    let endpoint: string, requestMethod: "PUT" | "POST";

    if (triggerMode === "trigger") {
      // If triggerMode is 'trigger' and the modify flag is set, the endpoint
      // is modify and the request method is PUT
      endpoint = event.modify ? "modify" : "trigger";
      requestMethod = event.modify ? "PUT" : "POST";
    } else {
      // In enqueue mode, the endpoint is 'enqueue' and the request method is POST
      endpoint = "enqueue";
      requestMethod = "POST";
    }

    // Compose URL and stringify event params
    const url = `/api/v1/document/${documentId}/events/${event.id}/${endpoint}`;
    const data = JSON.stringify(event.parameters.map((param) => {
      return { parameter: param.parameter, value: param.value };
    }));

    console.log("Launching basic event at url", url, "with data", data);

    try {
      // Launch event and invoke onTriggered callback if successful
      await makeRequest(requestMethod, url, data, "application/json");
      console.log("success");
      this.setState({ flashSuccess: true});
      this.props.onTriggered && this.props.onTriggered();
    } catch (err) {
      // Signal error if the request failed
      console.error("error:", err);
      this.setState({ flashError: true});
    }
  }

  /**
   * Renders the parameter count for an event and returns it as a formatted JSX
   * string. If zero is passed, the function returns `null`.
   *
   * @param count Number of parameters
   * @returns A JSX string displaying the count or `null`
   */
  private renderParamCount(count: number) {
    // Render nothing if event has no params
    if (count === 0) {
      return null;
    }

    // Render param count otherwise
    return (
      <p style={{fontStyle: "italic"}}>{count} parameter{(count === 1) ? "" : "s"}</p>
    );
  }

  /**
   * Renders the component
   */
  public render() {
    const { event } = this.props;
    const { isLoading, flashSuccess, flashError } = this.state;

    // Count params which don't have a preset value
    const paramCount = event.parameters.filter((param) => param.type !== "set").length;

    const boxStyle: React.CSSProperties = {
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      width: 380,
      backgroundColor: (event.state === "active") ? "#0C4620" : "transparent", boxShadow: "0 0 10px #161616",
      border: `1px solid ${(event.state === "active") ? "#23D160" : "#161616"}`, borderRadius: 5,
      margin: 10, padding: 25
    };

    // Render div displaying basic event properties
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
          <TriggerModeContext.Consumer>
            {(triggerMode) =>
              <button
                className={
                  classNames(
                    "button",
                    "is-info",
                    {"is-loading": isLoading, "button-pulse-success": flashSuccess, "button-pulse-error": flashError}
                  )
                }
                onClick={() => (paramCount === 0) ? this.launchEvent(triggerMode) : this.setState({showEventModal: true})}
                onAnimationEnd={() => this.setState({flashSuccess: false, flashError: false})}
              >
                {this.getButtonLabel(triggerMode)}
              </button>
            }
          </TriggerModeContext.Consumer>
        </div>
        {this.renderEventModal()}
      </div>
    );
  }
}

export default EventContainer;
