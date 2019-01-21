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

interface ErrorMessageProps {
  documentId?: string;
  statusText: string;
  status: number;
  message?: string;
}

const ErrorMessage: React.SFC<ErrorMessageProps> = (props) => {
  // Display HTTP error message, also rendering the document ID if available
  return (
    <div className="content" style={{width: "50vw", margin: "15% auto"}}>
      <article className="message is-danger">
        <div className="message-header">
          <p><strong>ERROR</strong>!</p>
        </div>
        <div className="message-body" style={{backgroundColor: "#555555", color: "#FFFFFF"}}>
          {(props.documentId)
            ? <span>An error occurred while trying to fetch events for the document with the ID <i>{props.documentId}</i>:</span>
            : <span>An error occurred while trying to complete your request:</span>
          }

          <div style={{margin: 25, fontWeight: "bold", textAlign: "center"}}>
            {props.statusText} (HTTP error {props.status})
            {props.message && <span style={{fontWeight: "normal"}}><br />{props.message}</span>}
          </div>

          {props.documentId && <span>Try to clear the session and start over.</span>}
        </div>
      </article>
    </div>
  );
};

export default ErrorMessage;
