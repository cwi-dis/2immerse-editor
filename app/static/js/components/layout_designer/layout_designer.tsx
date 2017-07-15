import * as React from "react";

import { ApplicationState } from "../../store";
import { ScreenActions } from "../../actions/screens";
import ScreenContainer from "./screen_container";

interface LayoutDesignerState {
  personalScreenWidth: number;
  communalScreenWidth: number;
}

class LayoutDesigner extends React.Component<ApplicationState & ScreenActions, LayoutDesignerState> {
  private communalColumn: HTMLDivElement;
  private personalColumn: HTMLDivElement;

  constructor(props: ApplicationState & ScreenActions) {
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
          <h3>Layout Designer</h3>

          <div className="block">
            <a style={{marginRight: 10}} className="button is-info" onClick={this.props.addDevice.bind(null, "communal")}>Add communal device</a>
            <a className="button is-info" onClick={this.props.addDevice.bind(null, "personal")}>Add personal device</a>
          </div>

          <br/>

          <div className="columns">
            <ScreenContainer title="Communal Device"
                             screens={communalScreens}
                             numColumns={8}
                             screenWidth={this.state.communalScreenWidth * 3 / 4}
                             colRef={(el) => this.communalColumn = el}
                             removeDevice={this.props.removeDevice}
                             splitRegion={this.props.splitRegion} />
            <ScreenContainer title="Personal Devices"
                             screens={personalScreens}
                             numColumns={4}
                             screenWidth={this.state.personalScreenWidth * 3 / 8}
                             colRef={(el) => this.personalColumn = el}
                             removeDevice={this.props.removeDevice}
                             splitRegion={this.props.splitRegion} />
          </div>
        </div>
      </div>
    );
  }
}

export default LayoutDesigner;
