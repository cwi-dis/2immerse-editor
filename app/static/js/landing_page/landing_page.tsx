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
import { Link } from "react-router-dom";

import CurrentVersion from "../editor/components/current_version";

/**
 * Provides a landing page, from which the user can access all other parts of
 * the application. These other parts of the application are connected via
 * standard hyperlinks, whereas the link to the configuration page and the
 * viewer are realised through separate components.
 */
const LandingPage: React.SFC<{}> = () => {
  // Render landing page with links to editor and trigger app as well as link
  // to preview player and global config
  return (
    <div>
      <h1 className="landingpage-caption title is-1">2-IMMERSE Authoring Platform</h1>
      <div className="landingpage-buttons">
        <a className="button is-info is-medium" onClick={function() { location.href=(window as any).EDITOR_ROOT + '/editor'; } }>Preproduction Authoring</a>
        <a className="button is-info is-medium" onClick={function() { location.href=(window as any).EDITOR_ROOT + '/trigger'; } }>Live Triggering</a>
        <Link className="button is-info is-medium" to="/view">View</Link>
      </div>
      <p className="landingpage-config">
        <Link to="/config">Config</Link>
      </p>
      <CurrentVersion />
    </div>
  );
};

export default LandingPage;
