import * as React from "react";

interface ErrorMessageProps {
  documentId: string;
  statusText: string;
  status: number;
}

const ErrorMessage: React.SFC<ErrorMessageProps> = (props) => {
  return (
    <div className="content" style={{width: "50vw", margin: "15% auto"}}>
      <article className="message is-danger">
        <div className="message-header">
          <p><strong>ERROR</strong>!</p>
        </div>
        <div className="message-body" style={{backgroundColor: "#555555", color: "#FFFFFF"}}>
          An error occurred while trying to fetch events for the document with
          the ID <i>{props.documentId}</i>:

          <div style={{margin: 25, fontWeight: "bold", textAlign: "center"}}>
            {props.statusText} (HTTP error {props.status})
          </div>

          Try to clear the session and start over.
        </div>
      </article>
    </div>
  );
};

export default ErrorMessage;
