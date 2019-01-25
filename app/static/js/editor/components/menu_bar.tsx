/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { NavLink } from "react-router-dom";

/**
 * This component renders a menu bar which is fixed to the top of the page and
 * simply contains links for `react-router` which point to the core connected
 * components of the application.
 */
class MenuBar extends React.Component<{}, {}> {
  /**
   * Renders the component
   */
  public render() {
    // Render bar on top of screen with basic navigation links
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
