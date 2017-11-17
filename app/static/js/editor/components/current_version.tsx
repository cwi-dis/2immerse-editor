import * as React from "react";
import { makeRequest } from "../util";

export interface CurrentVersionState {
  branch: string;
  revision: string;
  fetchError: boolean;
}

export interface CurrentVersionProps {
  commitUrl?: string;
}

class CurrentVersion extends React.Component<CurrentVersionProps, CurrentVersionState> {
  public static defaultProps: CurrentVersionProps = {
    commitUrl: "https://gitlab-ext.irt.de/2-immerse/2immerse-editor/commit/"
  };

  constructor(props: CurrentVersionProps) {
    super(props);

    this.state = {
      branch: "",
      revision: "",
      fetchError: false
    };
  }

  public componentDidMount() {
    makeRequest("GET", "/version").then((data) => {
      const [branch, revision] = JSON.parse(data);

      this.setState({
        branch,
        revision
      });
    }).catch(() => {
      this.setState({
        fetchError: true
      });
    });
  }

  public render() {
    const { branch, revision } = this.state;
    const style: React.CSSProperties = {
      position: "fixed",
      bottom: 0,
      left: 0,
      padding: "1px 5px 1px 5px",
      fontSize: 13,
      backgroundColor: "#555555",
      color: "#999999"
    };

    if (branch !== "" && revision !== "" && !this.state.fetchError) {
      return (
        <div style={style}>
          Current version:&nbsp;
          <a target="_blank" style={{color: "#BBBBBB", textDecoration: "underline"}} href={`${this.props.commitUrl}${revision}`}>
            {branch}/{revision}
          </a>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default CurrentVersion;
