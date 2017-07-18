import * as React from "react";
import { Link } from "react-router";

class MenuBar extends React.Component<{}, {}> {
  public render() {
    return (
      <div className="menubar">
        <div>
          <Link to="/" activeStyle={{color: "#319aee"}}>Design Layout</Link>
        </div>
        <div>
          <Link to="/masters" activeStyle={{color: "#319aee"}}>Manage Masters</Link>
        </div>
        <div>
          <Link to="/program" activeStyle={{color: "#319aee"}}>Author Program</Link>
        </div>
      </div>
    );
  }
}

export default MenuBar;