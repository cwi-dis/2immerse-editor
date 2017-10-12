import * as React from "react";

const LoadingSpinner: React.SFC<{}> = () => {
  return (
    <div className="content">
      <div className="loader" style={{marginTop: "15%"}} />
    </div>
  );
}

export default LoadingSpinner;
