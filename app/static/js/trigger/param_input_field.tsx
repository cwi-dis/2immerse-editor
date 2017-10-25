import * as React from "react";
import { EventParams } from "./trigger_client";

type ParamInputFieldProps = EventParams & {
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}

const ParamInputField: React.SFC<ParamInputFieldProps> = (props: ParamInputFieldProps) => {
  switch (props.type) {
  case "duration":
  case "time":
    return <input className="input is-info"
                  onChange={props.onChange.bind(this)}
                  type="number"
                  value={props.value}
                  min="0" />;
  case "string":
    return <input className="input is-info"
                  onChange={props.onChange.bind(this)}
                  value={props.value}
                  type="text" />;
  case "url":
    return <input className="input is-info"
                  onChange={props.onChange.bind(this)}
                  value={props.value}
                  type="url" />;
  case "const":
    return <input className="input"
                  defaultValue={props.value}
                  type="string"
                  disabled />;
  case "selection":
    return (
      <div className="select">
        <select onChange={props.onChange.bind(this)}>
          {props.options && props.options.map(({ label, value }) => {
            return <option value={value}>{label}</option>;
          })}
        </select>
      </div>
    );
  default:
    return <div>Parameter type not recognised</div>;
  }
};

export default ParamInputField;
