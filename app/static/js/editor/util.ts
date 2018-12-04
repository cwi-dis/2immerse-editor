import { Collection, List, Map } from "immutable";
import { ThunkAction } from "redux-thunk";
import { validate } from "jsonschema";

import { ApplicationState } from "./store";
import { Chapter } from "./reducers/chapters";
import { Timeline } from "./reducers/timelines";
import { Stage } from "react-konva";

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

export const colorPalette = ["#f67088", "#f77276", "#f7745f", "#f77637", "#e88131", "#db8831", "#d08e31", "#c79231", "#be9631", "#b59931", "#ad9c31", "#a49f31", "#9ba231", "#91a531", "#86a731", "#77aa31", "#63ae31", "#41b231", "#31b252", "#32b16a", "#33b07a", "#33af85", "#34ae8e", "#34ad96", "#35ad9d", "#35aca4", "#36acaa", "#36abb0", "#36aab6", "#37a9bd", "#38a8c5", "#38a7cd", "#39a6d8", "#3aa4e6", "#49a0f4", "#6e9af4", "#8795f4", "#9a8ff4", "#ac88f4", "#bc81f4", "#cc79f4", "#dc6ff4", "#ed61f4", "#f45ee9", "#f562d9", "#f565cc", "#f568bf", "#f56ab3", "#f66ca6", "#f66e99"];

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

export function findById<T extends {id: U}, U>(collection: Collection.Indexed<T>, search: U): [number, T] {
  return findByKey(collection as any, search, "id" as never)! as [number, T];
}

export function findByKey<T extends {[V in keyof T]: U}, U, V extends keyof T>(collection: Collection.Indexed<T>, search: U, key: V): [number, T] | undefined {
  return collection.findEntry((value: T) => value[key] === search);
}

export function generateChapterKeyPath(accessPath: Array<number>): List<number | string> {
  if (accessPath.length === 0) {
    return List();
  }
  return List(accessPath.slice(0, accessPath.length - 1).reduce((path: Array<string | number>, i) => {
    return path.concat([i, "children"]);
  }, [])).push(accessPath[accessPath.length - 1]);
}

export function getChapterAccessPath(chapters: List<Chapter>, chapterId: string): List<number> {
  return chapters.reduce((accessPath, chapter, i) => {
    if (chapter.id === chapterId) {
      return accessPath.push(i);
    }

    const childPath = getChapterAccessPath(chapter.children!, chapterId);
    if (childPath.isEmpty()) {
      return accessPath;
    }

    return accessPath.push(i).concat(childPath);
  }, List<number>());
}

export function getDescendantChapters(chapters: List<Chapter> | Chapter): List<Chapter> {
  const fn = (chapters: List<Chapter>, ids: List<Chapter>) => {
    return chapters.reduce((ids, chapter) => {
      return ids.push(chapter).concat(getDescendantChapters(chapter.children!));
    }, ids);
  };

  if (chapters.hasOwnProperty("size")) {
    return fn(chapters as List<Chapter>, List());
  }

  return fn((chapters as Chapter).children!, List());
}

export function getRandomInt(min: number = 0, max: number = 10) {
  if (min > max) {
    throw new Error("min must not be larger than max");
  }

  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}

export function between(x: number, lowerBound: number, higherBound: number, inclusive = false): boolean {
  return (inclusive) ? x >= lowerBound && x <= higherBound
                     : x > lowerBound && x < higherBound;
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
  const data = JSON.stringify({ longUrl: originalUrl });

  return new Promise((resolve, reject) => {
    makeRequest(
      "POST", `/shorturl`,
      data, "application/json"
    ).then((response) => {
      const { id } = JSON.parse(response);
      const shortUrl = `${location.protocol}//${location.host}/shorturl/${id}`;

      resolve(shortUrl);
    }).catch((err) => {
      reject(err);
    });
  });
}

export function validateLayout(layout: any): Promise<void> {
  return new Promise((resolve, reject) => {
    makeRequest("GET", "/static/dist/v4-document-schema.json").then((data) => {
      const schema = JSON.parse(data);
      const result = validate(layout, schema);

      if (result.valid) {
        resolve();
      } else {
        reject(result.errors);
      }
    });
  });
}

export function getCanvasDropPosition(stageWrapper: Nullable<Stage>, pageX: number, pageY: number) {
    if (!stageWrapper) {
      throw new Error("Stage ref is null");
    }

    const stage = stageWrapper.getStage();
    const {offsetLeft, offsetTop} = stage.container();

    return [
      pageX - offsetLeft,
      pageY - offsetTop
    ];
}

export function arraysEqual<T>(a: Array<T>, b: Array<T>): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export function getTimelineLength(timeline: Timeline | undefined): number {
  if (timeline) {
    return timeline.timelineTracks!.reduce((sum, { timelineElements }) => {
      return sum + timelineElements!.reduce((sum, e) => sum + e.offset + e.duration, 0);
    }, 0);
  }

  return 0;
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
