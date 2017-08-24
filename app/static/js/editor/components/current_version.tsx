import * as React from "react";
import { makeRequest } from "../util";

interface CurrentVersionState {
  hash: string;
}

class CurrentVersion extends React.Component<{}, CurrentVersionState> {
  constructor() {
    super();

    this.state = {
      hash: ""
    };
  }

  public componentDidMount() {
    makeRequest("GET", "/version").then((hash) => {
      this.setState({
        hash
      });
    });
  }

  public render() {
    const style: React.CSSProperties = {
      position: "fixed",
      bottom: 0,
      left: 0,
      padding: "1px 5px 1px 5px",
      fontSize: 13,
      backgroundColor: "#555555",
      color: "#999999"
    };

    if (this.state.hash !== "") {
      const hash = this.state.hash

      return (
        <div style={style}>
          Current version:&nbsp;
          <a target="_blank" style={{color: "#BBBBBB", textDecoration: "underline"}} href={`https://gitlab-ext.irt.de/2-immerse/2immerse-editor/commit/${hash}`}>
            {hash}
          </a>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default CurrentVersion;
