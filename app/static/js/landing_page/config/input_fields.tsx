import * as React from "react";

interface URLInputFieldProps {
  label: string;
  value?: string;
}

export const URLInputField: React.SFC<URLInputFieldProps> = (props) => {
  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        <label className="label">{props.label}</label>
      </div>
      <div className="field-body">
        <div className="field">
          <div className="control">
            <input className="input" type="url" defaultValue={props.value} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface CheckboxInputFieldProps {
  label: string;
  defaultValue: boolean;
  description?: string;
}

export const CheckboxInputField: React.SFC<CheckboxInputFieldProps> = (props) => {
  return (
    <div className="field is-horizontal">
      <div className="field-label">
        <label className="label">{props.label}</label>
      </div>
      <div className="field-body">
        <div className="field">
          <div className="control">
            <label className="checkbox">
              <input type="checkbox" defaultChecked={props.defaultValue} />&emsp;&emsp;{props.description}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SelectInputFieldProps {
  label: string;
  options: Array<string>;
  defaultValue?: string;
}

export const SelectInputField: React.SFC<SelectInputFieldProps> = (props) => {
  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        <label className="label">{props.label}</label>
      </div>
      <div className="field-body">
        <div className="field is-narrow">
          <div className="control">
            <div className="select is-fullwidth">
              <select defaultValue={props.defaultValue}>
                {props.options.map((option, i) => {
                  return (<option key={i}>{option}</option>);
                })}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
