import * as React from "react";
import { Event } from "../trigger_client";

interface EventModalProps {
  event: Event;
}

class EventModal extends React.Component<EventModalProps, {}> {
  public render() {
    return (
      <div className="box">Hello World</div>
    );
  }
}

export default EventModal;
