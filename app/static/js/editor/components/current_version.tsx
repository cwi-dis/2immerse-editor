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
import { makeRequest } from "../util";

/**
 * Props for CurrentVersion
 */
export interface CurrentVersionProps {
  commitUrl?: string;
}

/**
 * State for CurrentVersion
 */
export interface CurrentVersionState {
  branch: string;
  revision: string;
  fetchError: boolean;
}

/**
 * Renders a label in the bottom left of the screen which displays the current
 * branch name and revision hash. This data is retrieved from the API. If the
 * data could not be retrieved, nothing is rendered. Moreover, when clicked,
 * the user is redirected to the corresponding commit in the repository.
 *
 * @param commitUrl URL which when combined with the commit hash points to said commit. Optional
 */
class CurrentVersion extends React.Component<CurrentVersionProps, CurrentVersionState> {
  public static defaultProps: CurrentVersionProps = {
    commitUrl: "https://github.com/2-IMMERSE/editor/commit/"
  };

  constructor(props: CurrentVersionProps) {
    super(props);

    this.state = {
      branch: "",
      revision: "",
      fetchError: false
    };
  }

  /**
   * Called when the component first mounts. Retrieves the current branch name
   * and revision hash from the API and updates the state or sets the error
   * condition if the request fails.
   */
  public async componentDidMount() {
    try {
      // Request current branch and revision from API
      const data = await makeRequest("GET", "/version");
      const [branch, revision] = JSON.parse(data);

      this.setState({
        branch,
        revision
      });
    } catch {
      this.setState({
        fetchError: true
      });
    }
  }

  /**
   * Renders the component
   */
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

    // Render nothing if branch name or revision are empty or if the fetchError
    // flag is true
    if (branch !== "" && revision !== "" && !this.state.fetchError) {
      return (
        <div style={style}>
          Current version:&nbsp;
          <a target="_blank" rel="noreferrer" style={{color: "#BBBBBB", textDecoration: "underline"}} href={`${this.props.commitUrl}${revision}`}>
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
