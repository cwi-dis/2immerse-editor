import * as React from "react";
import { ActionCreatorsMapObject, bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";

import { ApplicationState } from "../../store";
import { ScreenState } from "../../reducers/screens";
import * as screenActions from "../../actions/screens";
import { ScreenActions } from "../../actions/screens";
import ScreenContainer from "./screen_container";

type LayoutDesignerProps = {
  screens: ScreenState
} & ScreenActions;

interface LayoutDesignerState {
  personalScreenWidth: number;
  communalScreenWidth: number;
}

class LayoutDesigner extends React.Component<LayoutDesignerProps, LayoutDesignerState> {
  private communalColumn: HTMLDivElement;
  private personalColumn: HTMLDivElement;

  constructor(props: LayoutDesignerProps) {
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
    const { previewScreens: screens } = this.props.screens;
    const personalScreens = screens.filter((screen) => screen.type === "personal");
    const communalScreens = screens.filter((screen) => screen.type === "communal");

    return (
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
                            removeDevice={this.props.removeDeviceAndUpdateMasters}
                            splitRegion={this.props.splitRegion}
                            undoLastSplit={this.props.undoLastSplitAndUpdateMasters} />
          <ScreenContainer title="Personal Devices"
                            screens={personalScreens}
                            numColumns={4}
                            screenWidth={this.state.personalScreenWidth * 3 / 8}
                            colRef={(el) => this.personalColumn = el}
                            removeDevice={this.props.removeDeviceAndUpdateMasters}
                            splitRegion={this.props.splitRegion}
                            undoLastSplit={this.props.undoLastSplitAndUpdateMasters} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: ApplicationState): { screens: ScreenState } {
  return {
    screens: state.screens,
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators<any>(Object.assign({} as ActionCreatorsMapObject,
    screenActions.actionCreators
  ), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutDesigner);
