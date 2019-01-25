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

import CurrentVersion from "./current_version";
import MenuBar from "./menu_bar";

/**
 * Layout provides a wrapper around the application and renders components
 * which are displayed throughout the entire application, such as the MenuBar
 * component.
 *
 * @param props Props for rendering children
 */
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
