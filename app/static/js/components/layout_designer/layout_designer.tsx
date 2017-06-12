import * as React from "react";

import { ApplicationState } from "../../store";
import Screen from "./screen";

interface LayoutDesignerProps {
  addDevice: (type: "personal" | "communal") => void;
  removeDevice: (id: string) => void;
  splitRegion: (screenId: string, regionId: string, orientation: "horizontal" | "vertical", position: number) => void;
}

type CombinedProps = ApplicationState & LayoutDesignerProps;

interface LayoutDesignerState {
  personalScreenWidth: number;
  communalScreenWidth: number;
}

class LayoutDesigner extends React.Component<CombinedProps, LayoutDesignerState> {
  private communalColumn: HTMLDivElement;
  private personalColumn: HTMLDivElement;

  constructor(props: CombinedProps) {
    super(props);

    this.state = {
      personalScreenWidth: 0,
      communalScreenWidth: 0
    };
  }

  public componentDidMount() {
    this.setState({
      personalScreenWidth: this.personalColumn.clientWidth,
      communalScreenWidth: this.communalColumn.clientWidth
    });
  }

  public render() {
    const { screens } = this.props;
    const personalScreens = screens.filter((screen) => screen.type === "personal");
    const communalScreens = screens.filter((screen) => screen.type === "communal");

    return (
      <div className="column" style={{overflow: "scroll"}}>
        <div className="content">
          <h1>Layout Designer</h1>

          <div className="block">
            <a style={{marginRight: 10}} className="button is-info" onClick={this.props.addDevice.bind(null, "communal")}>Add communal device</a>
            <a className="button is-info" onClick={this.props.addDevice.bind(null, "personal")}>Add personal device</a>
          </div>

          <br/>

          <div className="columns">
            <div className="column is-8" ref={(el) => this.communalColumn = el} style={{borderRight: "1px solid #B1B1B1"}}>
              <h3 style={{textAlign: "center"}}>Communal Device ({communalScreens.count()})</h3>
              <div>{communalScreens.map((screen, i) => {
                return (
                  <Screen key={i}
                          screenInfo={screen}
                          width={this.state.communalScreenWidth * 3 / 4}
                          removeDevice={this.props.removeDevice.bind(null, screen.id)}
                          splitRegion={this.props.splitRegion.bind(null, screen.id)} />
                );
              })}</div>
            </div>
            <div className="column is-4" ref={(el) => this.personalColumn = el}>
              <h3 style={{textAlign: "center"}}>Personal Devices ({personalScreens.count()})</h3>
              <div>{personalScreens.map((screen, i) => {
                return (
                  <Screen key={i}
                          screenInfo={screen}
                          width={this.state.personalScreenWidth * 3 / 8}
                          removeDevice={this.props.removeDevice.bind(null, screen.id)}
                          splitRegion={this.props.splitRegion.bind(null, screen.id)} />
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
