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
import * as classNames from "classnames";

import { makeRequest } from "../../editor/util";

interface SessionSettingsProps {
  documentId: string;
  clearSession: () => void;
  fetchError?: {status: number, statusText: string};
}

const SessionSettings: React.SFC<SessionSettingsProps> = (props) => {
  const { documentId, clearSession, fetchError } = props;
  const downloadUrl = `/api/v1/document/${documentId}`;

  const deleteSession = async () => {
    try {
      // Delete session on the server
      await makeRequest("DELETE", `/api/v1/document/${documentId}`);
      console.log("Document deleted successfully");
      // Invoke clearSession callback if delete was successful
      clearSession();
    } catch (err) {
      console.error("Could not delete document:", err);
    }
  };

  // Render button for saving an clearing the session. If there was an error
  // in the application, the save and delete buttons are disabled
  return (
    <div style={{borderBottom: "1px solid #DBDBDB", paddingBottom: 15}}>
      {fetchError === undefined ?
        <a
          href={downloadUrl}
          download="document.xml"
          style={{display: "block", margin: "10px auto 0 auto"}}
          className={classNames("button", "is-info")}
        >
          Save Document
        </a> :
        <button
          style={{display: "block", margin: "10px auto 0 auto", width: "100%"}}
          className={classNames("button", "is-info")}
          disabled={true}
        >
          Save Document
        </button>
      }
      <div className="buttons has-addons" style={{marginTop: 10}}>
        <span
          onClick={clearSession}
          style={{width: "50%"}}
          className="button is-warning"
        >
          Clear Session
        </span>
        <button
          onClick={deleteSession}
          disabled={fetchError !== undefined}
          style={{width: "50%"}}
          className="button is-danger"
        >
          Delete Session
        </button>
      </div>
    </div>
  );
};

export default SessionSettings;
