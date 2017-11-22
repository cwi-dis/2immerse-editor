import { Collection, List, Map } from "immutable";
import { ThunkAction } from "redux-thunk";

import { ApplicationState } from "./store";
import { Chapter } from "./reducers/chapters";

export type Coords = [number, number];
export type Nullable<T> = T | null;

export interface RouterProps {
  match: {
    path: string;
    url: string;
    params: any;
    isExact: boolean;
  };
  location: Location;
  history: History;
}

interface Action {
  type: string;
}

export interface BasicAction<T extends string> extends Action {
  type: T;
}

export interface PayloadAction<T extends string, U> extends BasicAction<T> {
  payload: U;
}

export type AsyncAction<R> = ThunkAction<R, ApplicationState, void>;

type HTTPMethods = "GET" | "POST" | "PUT" | "DELETE";
type PromiseResolve = (data: string) => void;
type PromiseReject = (err: {status: number, statusText: string, body?: string}) => void;

export function makeRequest(method: HTTPMethods, url: string, data?: any, contentType?: string): Promise<string> {
  return new Promise<string>((resolve: PromiseResolve, reject: PromiseReject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          body: xhr.response
        });
      }
    };

    xhr.onerror = () => {
      reject({
        status: xhr.status,
        statusText: xhr.statusText,
        body: xhr.response
      });
    };

    if (typeof data === "object" && !(data instanceof FormData)) {
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(data));
    } else {
      if (contentType) {
        xhr.setRequestHeader("Content-Type", contentType);
      }

      xhr.send(data);
    }
  });
}

export function padStart(s: any, targetLength: number, pad = "0") {
  s = s.toString();

  if (pad.length !== 1 || s.length > targetLength) {
    return s;
  }

  return Array(targetLength - s.length).fill(pad).join("") + s;
}

export function capitalize(str: string): string {
  if (str.length === 0) {
    return str;
  }

  return str[0].toUpperCase() + str.slice(1);
}

export function pluck<T>(obj: T, keys: Array<keyof T>): Partial<T> {
  const result: Partial<T> = {};

  keys.forEach((k) => {
    result[k] = obj[k];
  });

  return result;
}

export function findById<T extends {id: U}, U>(collection: Collection.Indexed<T>, id: U): [number, T] {
  return collection.findEntry((value: T) => value.id === id)!;
}

export function generateChapterKeyPath(accessPath: Array<number>): List<number | string> {
  if (accessPath.length === 0) {
    return List();
  }

  return List(accessPath.slice(0, accessPath.length - 1).reduce((path: Array<string | number>, i) => {
    return path.concat([i, "children"]);
  }, [])).push(accessPath[accessPath.length - 1]);
}

export function getRandomInt(min: number = 0, max: number = 10) {
  if (min > max) {
    throw new Error("min must not be larger than max");
  }

  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}

export function countLeafNodes(chapter: Chapter): number {
  const children = chapter.get("children") as List<Chapter>;

  if (children.count() === 0) {
    return 1;
  }

  return children.reduce((leafNodeCount, childChapter: Chapter) => {
    return leafNodeCount + countLeafNodes(childChapter);
  }, 0);
}

export function getTreeHeight(chapters: List<Chapter>): number {
  if (chapters.count() === 0) {
    return 0;
  }

  return chapters.map((childChapter: Chapter) => {
    return 1 + getTreeHeight(childChapter.get("children") as List<Chapter>);
  }).max()!;
}

export function parseQueryString(query: string): Map<string, string | undefined> {
  let result = Map<string, string | undefined>();

  query.split("&").filter((pair) => {
    const [key, val] = pair.split("=");

    const sanitisedKey = key.replace(/[^a-zA-Z0-9_-]/g, "");
    const sanitisedVal = (val) ? decodeURIComponent(val) : val;

    if (sanitisedKey.length > 0) {
      result = result.set(
        sanitisedKey,
        sanitisedVal
      );
    }
  });

  return result;
}

export function shortenUrl(originalUrl: string): Promise<string> {
  const KEY = "AIzaSyDv6yE4WVhdAW44qxkoV-BF2V4I9oD9gqg";
  const data = JSON.stringify({ longUrl: originalUrl });

  return new Promise((resolve, reject) => {
    makeRequest(
      "POST", `https://www.googleapis.com/urlshortener/v1/url?key=${KEY}`,
      data, "application/json"
    ).then((response) => {
      const { id: shortUrl } = JSON.parse(response);
      resolve(shortUrl);
    }).catch((err) => {
      reject(err);
    });
  });
}

type ActionHandlerFunction<T> = (state: T, action: Action) => T;

export class ActionHandler<T> {
  private initialState: T;
  private handlers: Map<string, ActionHandlerFunction<T>>;

  constructor(initialState: T) {
    this.initialState = initialState;
    this.handlers = Map();
  }

  public addHandler(action: string, fn: ActionHandlerFunction<T>) {
    this.handlers = this.handlers.set(action, fn);
  }

  public getReducer(): ActionHandlerFunction<T> {
    return (state: T = this.initialState, action: Action) => {
      if (this.handlers.has(action.type)) {
        return this.handlers.get(action.type)!(state, action);
      }

      return state;
    };
  }
}
