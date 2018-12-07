import * as React from "react";
import { NavLink } from "react-router-dom";

class MenuBar extends React.Component<{}, {}> {
  public render() {
    return (
      <div className="menubar">
        <div>
          <NavLink exact={true} to="/" activeStyle={{color: "#319aee"}}>Home</NavLink>
        </div>
        <div>
          <NavLink to="/layout" activeStyle={{color: "#319aee"}}>Design Layout</NavLink>
        </div>
        <div>
          <NavLink to="/program" activeStyle={{color: "#319aee"}}>Author Program</NavLink>
        </div>
      </div>
    );
  }
}

export default MenuBar;
