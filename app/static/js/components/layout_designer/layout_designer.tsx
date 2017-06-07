import * as React from "react";

import { ApplicationState } from "../../store";
import Screen from "./screen";

interface LayoutDesignerProps {
  addPersonalDevice: () => void;
  addCommunalDevice: () => void;
  removePersonalDevice: (id: number) => void;
  removeCommunalDevice: (id: number) => void;
}

class LayoutDesigner extends React.Component<ApplicationState & LayoutDesignerProps, {}> {
  public render() {
    const { screens } = this.props;

    return (
      <div className="column" style={{overflow: "scroll"}}>
        <div className="content">
          <h1>Layout Designer</h1>

          <div className="block">
            <a style={{marginRight: 10}} className="button is-info" onClick={this.props.addCommunalDevice}>Add communal device</a>
            <a className="button is-info" onClick={this.props.addPersonalDevice}>Add personal device</a>
          </div>

          <br/>

          <div className="columns">
            <div className="column is-8" style={{borderRight: "1px solid #B1B1B1"}}>
              <h3 style={{textAlign: "center"}}>Communal Device ({this.props.screens.communalScreens.count()})</h3>
              <div>{screens.communalScreens.map((screen, i) => {
                return (
                  <Screen key={i} screenInfo={screen} removeDevice={this.props.removeCommunalDevice.bind(null, i)} />
                );
              })}</div>
            </div>
            <div className="column is-4">
              <h3 style={{textAlign: "center"}}>Personal Devices ({this.props.screens.personalScreens.count()})</h3>
              <div>{screens.personalScreens.map((screen, i) => {
                return (
                  <Screen key={i} screenInfo={screen} removeDevice={this.props.removePersonalDevice.bind(null, i)} />
                );
              })}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LayoutDesigner;
