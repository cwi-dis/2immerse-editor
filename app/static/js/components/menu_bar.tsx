import * as React from "react";
import { Link } from "react-router";

class MenuBar extends React.Component<{}, {}> {
  public render() {
    return (
      <div className="columns menubar" style={{textAlign: "center", fontSize: 20, marginTop: 10}}>
        <div className="column is-2 is-offset-3">
          <Link to="/" activeStyle={{color: "#319aee"}}>Design Layout</Link>
        </div>
        <div className="column is-2">
          <Link to="/masters" activeStyle={{color: "#319aee"}}>Manage Masters</Link>
        </div>
        <div className="column is-2">
          <Link to="/program" activeStyle={{color: "#319aee"}}>Author Program</Link>
        </div>
      </div>
    );
  }
}

export default MenuBar;