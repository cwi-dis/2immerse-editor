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

/**
 * Renders a CSS-based spinner which can be used to indicate to the user that
 * the application is in the process of loading data, e.g. from a server.
 */
const LoadingSpinner: React.SFC<{}> = () => {
  // Display a loading spinner implemented through a CSS animation
  return (
    <div className="content">
      <div className="loader" style={{marginTop: "15%"}} />
    </div>
  );
};

export default LoadingSpinner;
