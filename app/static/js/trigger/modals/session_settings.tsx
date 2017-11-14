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

  const deleteSession = () => {
    makeRequest("DELETE", `/api/v1/document/${documentId}`).then(() => {
      console.log("Document deleted successfully");
      clearSession();
    }).catch((err) => {
      console.error("Could not delete document:", err);
    });
  };

  return (
    <div>
      {fetchError === undefined ?
        <a href={downloadUrl}
            download="document.xml"
            style={{display: "block", margin: "10px auto 0 auto"}}
            className={classNames("button", "is-info")}>
          Save Document
        </a> :
        <button style={{display: "block", margin: "10px auto 0 auto", width: "100%"}}
                className={classNames("button", "is-info")}
                disabled={true}>
          Save Document
        </button>
      }
      <a onClick={clearSession}
          style={{display: "block", margin: "10px auto 0 auto"}}
          className="button is-warning">
        Clear Session
      </a>
      <a onClick={deleteSession}
          style={{display: "block", margin: "10px auto 0 auto"}}
          className="button is-danger">
        Clear &amp; Delete Session
      </a>
    </div>
  );
};

export default SessionSettings;
