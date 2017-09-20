import * as React from "react";
import { Link } from "react-router";

import CurrentVersion from "../editor/components/current_version";

const LandingPage: React.SFC<{}> = () => {
  return (
    <div>
      <h1 className="landingpage-caption title is-1">2-IMMERSE Authoring Platform</h1>
      <div className="landingpage-buttons">
        <a className="button is-info is-medium" href="/editor">Preproduction Authoring</a>
        <a className="button is-info is-medium" href="/trigger">Live Triggering</a>
      </div>
      <p className="landingpage-config">
        <Link to="/config">Config</Link>
      </p>
      <CurrentVersion />
    </div>
  );
};

export default LandingPage;
