import * as React from "react";

import { ApplicationState } from "../../store";

interface LayoutDesignerProps {
  addPersonalDevice: () => void;
  addCommunalDevice: () => void;
}

class LayoutDesigner extends React.Component<ApplicationState & LayoutDesignerProps, {}> {
  public render() {
    return (
      <div className="column">
        <div className="content">
          <h1>Layout Designer</h1>

          <div className="block">
            <a style={{marginRight: 10}} className="button is-info" onClick={this.props.addCommunalDevice}>Add communal device</a>
            <a className="button is-info" onClick={this.props.addPersonalDevice}>Add personal device</a>
          </div>

          <br/>

          <div className="columns">
            <div className="column is-8" style={{borderRight: "1px solid #B1B1B1"}}>
              <h3 style={{textAlign: "center"}}>Communal Device ({this.props.screens.communalScreens.length})</h3>
              <p>{this.props.screens.communalScreens.map((screen, i) => <span key={i}>{screen}, </span>)}</p>
            </div>
            <div className="column is-4">
              <h3 style={{textAlign: "center"}}>Personal Devices ({this.props.screens.personalScreens.length})</h3>
              <p>{this.props.screens.personalScreens.map((screen, i) => <span key={i}>{screen}, </span>)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LayoutDesigner;
