import * as React from "react";
import { EventParams } from "./trigger_client";

type ParamInputFieldProps = EventParams & {
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
};

const ParamInputField: React.SFC<ParamInputFieldProps> = (props: ParamInputFieldProps) => {
  switch (props.type) {
  case "duration":
  case "time":
    // Render a numeric input field if type is either 'duration' or 'time'
    return (
      <input
        className="input is-info"
        onChange={props.onChange.bind(this)}
        type="number"
        value={props.value}
        min="0"
      />
    );
  case "string":
    // Render a string input field if type is 'string'
    return (
      <input
        className="input is-info"
        onChange={props.onChange.bind(this)}
        value={props.value}
        type="text"
      />
    );
  case "url":
    // Render a URL input field if type is 'url'
    return (
      <input
        className="input is-info"
        onChange={props.onChange.bind(this)}
        value={props.value}
        type="url"
      />
    );
  case "const":
    // Render a disabled input field with the given value if type is 'const'
    return (
      <input
        className="input"
        defaultValue={props.value}
        type="string"
        disabled={true}
      />
    );
  case "selection":
    // Render a dropdown with associated values if type is 'selection'
    return (
      <div className="select is-fullwidth">
        <select onChange={props.onChange.bind(this)} value={props.value}>
          {props.options && props.options.map(({ label, value }, i) => {
            return <option value={value} key={i}>{label}</option>;
          })}
        </select>
      </div>
    );
  default:
    // Render error message otherwise
    return <div>Parameter type not recognised</div>;
  }
};

export default ParamInputField;
