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
    <div style={{borderBottom: "1px solid #DBDBDB", paddingBottom: 15}}>
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
      <div className="buttons has-addons" style={{marginTop: 10}}>
        <span onClick={clearSession}
              style={{width: "50%"}}
              className="button is-warning">
          Clear Session
        </span>
        <span onClick={deleteSession}
              style={{width: "50%"}}
              className="button is-danger">
          Delete Session
        </span>
      </div>
    </div>
  );
};

export default SessionSettings;
