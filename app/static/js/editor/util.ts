import { Collection, List } from "immutable";
import { Chapter } from "./reducers/chapters";

export type Coords = [number, number];
interface Action {
  type: string;
}

export interface BasicAction<T extends string> extends Action {
  type: T;
}

export interface PayloadAction<T extends string, U> extends BasicAction<T> {
  payload: U;
}

export function makeRequest(method: "GET" | "POST" | "PUT", url: string, data?: any, contentType?: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      }
    };

    xhr.onerror = () => {
      reject({
        status: xhr.status,
        statusText: xhr.statusText
      });
    };

    if (contentType) {
      xhr.setRequestHeader("Content-Type", contentType);
    }

    xhr.send(data);
  });
}

export function findById<T extends {id: U}, U>(collection: Collection.Indexed<T>, id: U): [number, T] {
  return collection.findEntry((value: T) => value.id === id)!;
}

export function generateChapterKeyPath(accessPath: Array<number>): List<number | string> {
  return List(accessPath.slice(0, accessPath.length - 1).reduce((path: Array<string | number>, i) => {
    return path.concat([i, "children"]);
  }, [])).push(accessPath[accessPath.length - 1]);
}

export function getRandomInt(min: number = 0, max: number = 10) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}

export function countLeafNodes(chapter: Chapter): number {
  const children = chapter.get("children") as List<Chapter>;

  if (children.count() === 0) {
    return 1;
  }

  let leafNodeCount = 0;

  children.forEach((childChapter: Chapter) => {
    leafNodeCount += countLeafNodes(childChapter);
  });

  return leafNodeCount;
}

export function getTreeHeight(chapters: List<Chapter>): number {
  if (chapters.count() === 0) {
    return 0;
  }

  return chapters.map((childChapter: Chapter) => {
    return 1 + getTreeHeight(childChapter.get("children") as List<Chapter>);
  }).max()!;
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
