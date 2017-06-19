import { Collection } from "immutable";
import { Action } from "./actions";

export function findById<T extends {id: U}, U>(collection: Collection.Indexed<T>, id: U): [number, T] {
  return collection.findEntry((value: T) => value.id === id)!;
}

export function getRandomInt(min: number = 0, max: number = 10) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}

type ActionHandlerFunction<T> = (state: T, action: Action) => T;

export class ActionHandler<T> {
  private initialState: T;
  private handlers: {[key: string]: ActionHandlerFunction<T>};

  constructor(initialState: T) {
    this.initialState = initialState;
    this.handlers = {};
  }

  public addHandler(action: string, fn: ActionHandlerFunction<T>) {
    this.handlers[action] = fn;
  }

  public getReducer(): ActionHandlerFunction<T> {
    return (state: T = this.initialState, action: Action) => {
      for (const key in this.handlers) {
        if (key === action.type) {
          return this.handlers[key](state, action);
        }
      }

      return state;
    };
  }
}
