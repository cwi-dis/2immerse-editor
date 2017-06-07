import * as React from "react";

import { ApplicationState } from "../../store";
import Screen from "./screen";

interface LayoutDesignerProps {
  addPersonalDevice: () => void;
  addCommunalDevice: () => void;
  removeDevice: (id: string) => void;
}

class LayoutDesigner extends React.Component<ApplicationState & LayoutDesignerProps, {}> {
  private communalColumn: HTMLDivElement;
  private personalColumn: HTMLDivElement;

  public render() {
    const { screens } = this.props;
    const personalScreens = screens.filter((screen) => screen.type === "personal");
    const communalScreens = screens.filter((screen) => screen.type === "communal");

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
            <div className="column is-8" ref={(el) => this.communalColumn = el} style={{borderRight: "1px solid #B1B1B1"}}>
              <h3 style={{textAlign: "center"}}>Communal Device ({communalScreens.count()})</h3>
              <div>{communalScreens.map((screen, i) => {
                return (
                  <Screen key={i} screenInfo={screen} width={this.communalColumn.clientWidth * 3 / 4} removeDevice={this.props.removeDevice.bind(null, screen.id)} />
                );
              })}</div>
            </div>
            <div className="column is-4" ref={(el) => this.personalColumn = el}>
              <h3 style={{textAlign: "center"}}>Personal Devices ({personalScreens.count()})</h3>
              <div>{personalScreens.map((screen, i) => {
                return (
                  <Screen key={i} screenInfo={screen} width={this.personalColumn.clientWidth * 1 / 2} removeDevice={this.props.removeDevice.bind(null, screen.id)} />
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
