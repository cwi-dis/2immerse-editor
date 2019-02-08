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

import { Event } from "./trigger_client";
import { makeRequest } from "../editor/util";

/**
 * Props for QueuedEventContainer
 */
interface QueuedEventContainerProps {
  documentId: string;
  event: Event;
}

/**
 * Renders a single event as part of a `QueuedEventList`. Based on the type of
 * event, border and background colours change. Moreover, for active events,
 * a close icon is rendered which can be used to dequeue the events.
 *
 * @param documentId Document ID of the current session
 * @param event Event to be rendered
 */
const QueuedEventContainer: React.SFC<QueuedEventContainerProps> = (props) => {
  const { event, documentId } = props;

  // Foreground and background colours for event containers
  const colors = {
    "abstract": ["#161616", "transparent"],
    "ready": ["#C95A26", "#795341"],
    "active": ["#23D160", "#0C4620"]
  };

  // Get colours based on type of event
  const [borderColor, bgColor] = colors[event.state];
  const containerStyle: React.CSSProperties = {
    border: `1px solid ${borderColor}`,
    backgroundColor: bgColor,
    float: "left"
  };

  const dequeueEvent = async () => {
    // Drop an event from the queue
    console.log("Dequeueing event", event.id);
    const url = `/api/v1/document/${documentId}/events/${event.id}/dequeue`;

    try {
      // Launch request and print message console
      await makeRequest("POST", url);
      console.log("Event dequeued successfully");
    } catch (err) {
      console.error("Could not dequeue event", err);
    }
  };

  return (
    <div className="queued-event-container" style={containerStyle}>
      {(event.state === "active") ? null : <span onClick={dequeueEvent}>&times;</span>}
      {event.name}
    </div>
  );
};

/**
 * Props for QueuedEventList
 */
interface QueuedEventListProps {
  documentId: string;
  events: Array<Event>;
}

/**
 * Renders a list of already queued events, filtering out abstract ones and
 * replacing ready events with their active counterparts where available by
 * matching them using their `productionId`.
 *
 * @param documentId Document ID of the current session
 * @param events List of events to be rendered
 */
const QueuedEventList: React.SFC<QueuedEventListProps> = (props) => {
  const { events, documentId } = props;
  // Get active events
  const activeEvents = events.filter((event) => event.state === "active");

  // Get all queued events and replace the ones which have an active version
  // with that active version
  const queuedEvents = events.filter((event) => {
    return event.state === "ready";
  }).map((event) => {
    return activeEvents.find((active) => active.productionId === event.productionId) || event;
  });

  return (
    <div className="queued-event-list">
      {queuedEvents.map((event, i) => {
        return <QueuedEventContainer key={i} event={event} documentId={documentId} />;
      })}
    </div>
  );
};

export default QueuedEventList;
