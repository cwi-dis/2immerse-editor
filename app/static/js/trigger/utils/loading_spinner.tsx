import * as React from "react";

const LoadingSpinner: React.SFC<{}> = () => {
  // Display a loading spinner implemented through a CSS animation
  return (
    <div className="content">
      <div className="loader" style={{marginTop: "15%"}} />
    </div>
  );
};

export default LoadingSpinner;
