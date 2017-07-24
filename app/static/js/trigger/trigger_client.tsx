import * as React from "react";
import * as classNames from "classnames";

import { makeRequest } from "../editor/util";
import EventContainer from "./event_container";

interface TriggerClientProps {
  documentId: string;
}

export interface EventParams {
  name: string;
  parameter: string;
  type: string;
}

export interface Event {
  trigger: boolean;
  modify: boolean;
  id: string;
  parameters: Array<EventParams>;
  name: string;
}

interface TriggerClientState {
  activeTab: "abstract" | "instantiated";
  abstractEvents: Array<Event>;
  instantiatedEvents: Array<any>;
}

class TriggerClient extends React.Component<TriggerClientProps, TriggerClientState> {
  constructor(props: TriggerClientProps) {
    super(props);

    this.state = {
      activeTab: "abstract",
      abstractEvents: [],
      instantiatedEvents: []
    };
  }

  private changeActiveTab(nextTab: "abstract" | "instantiated") {
    this.setState({
      activeTab: nextTab
    });
  }

  private renderActiveTab(): Array<JSX.Element> {
    if (this.state.activeTab === "abstract") {
      return this.state.abstractEvents.map((event: Event, i) => {
        return (
          <EventContainer key={i}
                          documentId={this.props.documentId}
                          event={event}
                          onTriggered={this.fetchEvents.bind(this)} />
        );
      });
    } else {
      return this.state.instantiatedEvents.map((event: Event, i) => {
        return (
          <EventContainer key={i} documentId={this.props.documentId} event={event} />
        );
      });
    }
  }

  private fetchEvents() {
    const url = `/api/v1/document/${this.props.documentId}/events`;
    console.log("updating events");

    makeRequest("GET", url).then((data) => {
      const events: Array<Event> = JSON.parse(data);

      this.setState({
        abstractEvents: events.filter((ev) => ev.trigger),
        instantiatedEvents: events.filter((ev) => ev.modify)
      });
    }).catch((err) => {
      console.error("Could not fetch triggers:", err);
    });
  }

  public componentDidMount() {
    this.fetchEvents();
  }

  public render() {
    const { activeTab, abstractEvents, instantiatedEvents } = this.state;

    return (
      <div className="container" style={{width: "60vw"}}>
        <div className="tabs is-centered" style={{marginTop: 15}}>
          <ul>
            <li className={classNames({"is-active": activeTab === "abstract"})}>
              <a onClick={this.changeActiveTab.bind(this, "abstract")}>Events ({this.state.abstractEvents.length})</a>
            </li>
            <li className={classNames({"is-active": activeTab === "instantiated"})}>
              <a onClick={this.changeActiveTab.bind(this, "instantiated")}>Triggered Events ({instantiatedEvents.length})</a>
            </li>
          </ul>
        </div>
        <div className="content" style={{paddingBottom: 70}}>
          {this.renderActiveTab()}
        </div>
      </div>
    );
  }
}

export default TriggerClient;
