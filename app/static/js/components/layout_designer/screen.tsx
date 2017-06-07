import * as React from "react";

import { ApplicationState } from "../../store";
import { Screen as ScreenModel } from "../../reducers/screens";

interface ScreenProps {
  screenInfo: ScreenModel;
  removeDevice: () => void;
}

class Screen extends React.Component<ScreenProps, {}> {
  public render() {
    const screen = this.props.screenInfo;

    return (
      <p>
        Name: {screen.name} Orientation: {screen.orientation}
        <br/>
        <span style={{cursor: "pointer", color: "#FF0000"}} onClick={this.props.removeDevice}>remove</span>
      </p>
    );
  }
}

export default Screen;