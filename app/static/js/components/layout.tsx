import * as React from "react";
import { Link } from "react-router";

import MenuBar from "./menu_bar";

class Layout extends React.Component<{children?: any}, {}> {
  public render() {
    return (
      <div>
        <div style={{width: "100%", height: 50}}>
          <MenuBar/>
        </div>
        <div>{React.cloneElement(this.props.children, Object.assign({}, this.props))}</div>
      </div>
    );
  }
}

export default Layout;
