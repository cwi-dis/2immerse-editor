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
