import { Map } from "immutable";

interface Action {
  type: string;
}

type ActionHandlerFunction<T> = (state: T, action: Action) => T;

export class ActionHandler<T> {
  private initialState: T;
  private handlers: Map<string, ActionHandlerFunction<T>>;

  constructor(initialState: T) {
    // Initialise initialState with given object and create empty callback map
    this.initialState = initialState;
    this.handlers = Map();
  }

  public addHandler(action: string, fn: ActionHandlerFunction<T>) {
    // Create new entry in handlers map with action name as key and callback as value
    this.handlers = this.handlers.set(action, fn);
  }

  public getReducer(): ActionHandlerFunction<T> {
    // Return a reducer function which checks the map for the given action name and invokes
    // the associated function to transform the given state or returns the state unchanged
    // otherwise
    return (state: T = this.initialState, action: Action) => {
      if (this.handlers.has(action.type)) {
        return this.handlers.get(action.type)!(state, action);
      }

      return state;
    };
  }
}
