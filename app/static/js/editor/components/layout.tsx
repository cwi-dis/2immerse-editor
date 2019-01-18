import * as React from "react";

import CurrentVersion from "./current_version";
import MenuBar from "./menu_bar";

const Layout: React.SFC<{}> = (props) => {
  // Basic layout for application with fixed menu bar on top and version string
  return (
    <div className="wrapper">
      <MenuBar />
      {props.children}
      <CurrentVersion />
    </div>
  );
};

export default Layout;
