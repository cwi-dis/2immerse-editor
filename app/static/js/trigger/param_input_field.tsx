import * as React from "react";

interface ParamInputFieldProps {
  type: string;
  value: string;

  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}

const ParamInputField: React.SFC<ParamInputFieldProps> = (props: ParamInputFieldProps) => {
  const { type, value, onChange } = props;

  switch (type) {
  case "duration":
  case "time":
    return <input className="input is-info"
                  onChange={onChange.bind(this)}
                  type="number"
                  value={value}
                  min="0" />;
  case "string":
    return <input className="input is-info"
                  onChange={onChange.bind(this)}
                  value={value}
                  type="text" />;
  case "url":
    return <input className="input is-info"
                  onChange={onChange.bind(this)}
                  value={value}
                  type="url" />;
  case "const":
    return <input className="input"
                  defaultValue={value}
                  type="string"
                  disabled />;
  default:
    return <div>Parameter type not recognised</div>;
  }
}

export default ParamInputField;
