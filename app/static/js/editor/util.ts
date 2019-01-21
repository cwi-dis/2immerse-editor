/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Collection, List, Map, Set } from "immutable";
import { ThunkAction } from "redux-thunk";
import { validate } from "jsonschema";

import { ApplicationState } from "./store";
import { Chapter } from "./reducers/chapters";
import { Timeline, TimelineTrack, TimelineElement } from "./reducers/timelines";
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

// Basic colour palette for screen regions
export const colorPalette = ["#f67088", "#f77276", "#f7745f", "#f77637", "#e88131", "#db8831", "#d08e31", "#c79231", "#be9631", "#b59931", "#ad9c31", "#a49f31", "#9ba231", "#91a531", "#86a731", "#77aa31", "#63ae31", "#41b231", "#31b252", "#32b16a", "#33b07a", "#33af85", "#34ae8e", "#34ad96", "#35ad9d", "#35aca4", "#36acaa", "#36abb0", "#36aab6", "#37a9bd", "#38a8c5", "#38a7cd", "#39a6d8", "#3aa4e6", "#49a0f4", "#6e9af4", "#8795f4", "#9a8ff4", "#ac88f4", "#bc81f4", "#cc79f4", "#dc6ff4", "#ed61f4", "#f45ee9", "#f562d9", "#f565cc", "#f568bf", "#f56ab3", "#f66ca6", "#f66e99"];

export type AsyncAction<R, A extends Action> = ThunkAction<R, ApplicationState, void, A>;

type HTTPMethods = "GET" | "POST" | "PUT" | "DELETE";
type PromiseResolve = (data: string) => void;
type PromiseReject = (err: {status: number, statusText: string, body?: string}) => void;

/**
 * Launches a HTTP request for the given URL and method. Returns a promise
 * which resolves to a string containing the response text on success.
 *
 * @param method HTTP method. One of GET, POST, PUT or DELETE
 * @param url The target URL for the request
 * @param data Optional. Data to send with the request
 * @param contentType Optional. Content type of the request data
 * @returns A promise which resolves to the response body
 */
export function makeRequest(method: HTTPMethods, url: string, data?: any, contentType?: string): Promise<string> {
  // Return promise for HTTP request
  return new Promise<string>((resolve: PromiseResolve, reject: PromiseReject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    // Resolve promise if the HTTP return code is between 200 and 300, reject otherwise
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

    // Reject promise on error
    xhr.onerror = () => {
      reject({
        status: xhr.status,
        statusText: xhr.statusText,
        body: xhr.response
      });
    };

    // If data param is an object but not of type FormData, serialise it to JSON string
    if (typeof data === "object" && !(data instanceof FormData)) {
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(data));
    } else {
      // Otherwise, send data as is and set content type accordingly
      if (contentType) {
        xhr.setRequestHeader("Content-Type", contentType);
      }

      xhr.send(data);
    }
  });
}

/**
 * Pads a string on the left side with a given character to a specified length.
 * If the input string is longer than the target length or the padding string
 * is longer than one character, the input string will be returned unchanged.
 *
 * @param s The object to pad. Will be converted to string first
 * @param targetLength The target length of the desired string
 * @param pad The character the string should be padded with. Must be a single char
 * @returns The padded string
 */
export function padStart(s: any, targetLength: number, pad = "0") {
  s = s.toString();

  // Return string unchanged if pad is longer than 1 char or the string is
  // longer than the target length already
  if (pad.length !== 1 || s.length > targetLength) {
    return s;
  }

  // Generate pad chars of desired length and prepend it to string
  return Array(targetLength - s.length).fill(pad).join("") + s;
}

/**
 * Transforms a string by capitalising its first letter. If the first character
 * is not a letter or the string is empty, the input will be returned unchanged.
 *
 * @param str Input string
 * @returns The input string with the first letter capitalised
 */
export function capitalize(str: string): string {
  // If string if empty, return unchanged
  if (str.length === 0) {
    return str;
  }

  // Convert first char to uppercase and prepend it to rest of string
  return str[0].toUpperCase() + str.slice(1);
}

/**
 * Selects a subset of key-value pairs from an object and returns a new object
 * containing only the selected keys.
 *
 * @param obj Object to pluck keys from
 * @param keys Names of keys that should be plucked
 * @returns A new object with the given subset of keys
 */
export function pluck<T>(obj: T, keys: Array<keyof T>): Partial<T> {
  // Result is of type Partial<T>, i.e. contains a subset of keys in T
  const result: Partial<T> = {};

  // Pluck keys from the original object and store them in the result obj
  keys.forEach((k) => {
    result[k] = obj[k];
  });

  return result;
}

/**
 * Finds an object in a given collection by investigating each entry's key 'id'
 * and checking it against the given search value.
 *
 * @param collection Collection to search
 * @param search Value to search for
 * @returns The index the entry was found at and the entry itself as a tuple
 */
export function findById<T extends {id: U}, U>(collection: Collection.Indexed<T>, search: U): [number, T] {
  // Find given data in collection under the key id, returns [index, found_object]
  return findByKey(collection as any, search, "id" as never)! as [number, T];
}

/**
 * Finds an object in a given collection by investigating each entry's key
 * given by the parameter `key` and checking it against the given search value.
 * This is a more generic version of `findById()`
 *
 * @param collection Collection to search
 * @param search Value to search for
 * @param key The key which shall be checked
 * @returns The index the entry was found at and the entry itself as a tuple
 */
export function findByKey<T extends {[V in keyof T]: U}, U, V extends keyof T>(collection: Collection.Indexed<T>, search: U, key: V): [number, T] | undefined {
  // Find entry in collection under the key given by 'key', returns [index, found_object]
  return collection.findEntry((value: T) => value[key] === search);
}

/**
 * Generates an array containing indices to accessing nodes in a tree data
 * structure. Its input parameter is simply a list of indices. This list is
 * transformed in such a way, that it can be used to access tree data
 * structures the way they have been implemented in this project.
 *
 * @param accessPath An array of numbers specifying indices to index a tree
 * @returns A modified access path to navigate the actual data structure
 */
export function generateChapterKeyPath(accessPath: Array<number>): List<number | string> {
  // If the given access path is empty return empty List object
  if (accessPath.length === 0) {
    return List();
  }

  // Splice the entry "children" between each entry of the access path in order
  // to be able to navigate the chapter data structure
  return List(accessPath.slice(0, accessPath.length - 1).reduce((path: Array<string | number>, i) => {
    return path.concat([i, "children"]);
  }, [])).push(accessPath[accessPath.length - 1]);
}

/**
 * Returns a list of indices for accessing the chapter node identified by the
 * given id in a tree-like data structure of chapter nodes.
 *
 * @param chapters A tree-like data structure containing chapter nodes
 * @param chapterId The id of the chapter we want the path for
 * @returns A list of indices for locating the chapter with the given id in the tree
 */
export function getChapterAccessPath(chapters: List<Chapter>, chapterId: string): List<number> {
  // Find chapter with given ID in chapter tree by visiting all nodes recursively
  return chapters.reduce((accessPath, chapter, i) => {
    // If current chapter has given id, append index and return
    if (chapter.id === chapterId) {
      return accessPath.push(i);
    }

    // Call function recursively on children
    const childPath = getChapterAccessPath(chapter.children!, chapterId);
    // If chapter was not found among children, return path unchanged
    if (childPath.isEmpty()) {
      return accessPath;
    }

    // If path was found among children, push own id and append child path
    return accessPath.push(i).concat(childPath);
  }, List<number>());
}

/**
 * Returns a flattened list of all descendants of the given chapter node. This
 * function either accepts a single chapter node or a list or chapters (i.e.
 * a level of a chapter tree).
 *
 * @param chapters Single chapter or list of chapters
 * @returns A flattened list of all descendants of the given chapter
 */
export function getDescendantChapters(chapters: List<Chapter> | Chapter): List<Chapter> {
  const fn = (chapters: List<Chapter>, ids: List<Chapter>) => {
    // Map over chapter list and return chapters as flat list
    return chapters.reduce((ids, chapter) => {
      // Append chapters on current level to ids, call function recursively
      // and result to list
      return ids.push(chapter).concat(getDescendantChapters(chapter.children!));
    }, ids);
  };

  // If param chapters is a list itslef, call function on list object
  if (chapters.hasOwnProperty("size")) {
    return fn(chapters as List<Chapter>, List());
  }

  // If param chapters is a single chapter, call function on children
  return fn((chapters as Chapter).children!, List());
}

/**
 * Returns a random integer between the given bounds, or between 0 and 10 if
 * no bounds are given. The values for the bounds are rounded to integers.
 *
 * @param min Lower bound for random number
 * @param max Upper bound for random number
 * @returns A random number within the given bounds
 */
export function getRandomInt(min: number = 0, max: number = 10) {
  // Throw error if min > max
  if (min > max) {
    throw new Error("min must not be larger than max");
  }

  // Make sure min and max are integers
  min = Math.ceil(min);
  max = Math.floor(max);

  // Return integer within the given range
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Checks if a given value is between the given bounds. The check can either be
 * performed inclusive or exclusive.
 *
 * @param x The number to be checked
 * @param lowerBound The lower bound
 * @param higherBound The upper bound
 * @param inclusive Whether the check should include the bounds or not
 * @returns True or false
 */
export function between(x: number, lowerBound: number, higherBound: number, inclusive = false): boolean {
  // Check whether given value is within bounds
  return (inclusive) ? x >= lowerBound && x <= higherBound
                     : x > lowerBound && x < higherBound;
}

/**
 * Takes a node in a chapter tree and counts leaf nodes reachable from it.
 *
 * @param chapter Chapter node from which to start counting
 * @returns Number of leaf nodes
 */
export function countLeafNodes(chapter: Chapter): number {
  // Get children of given chapter
  const children = chapter.get("children") as List<Chapter>;

  // If chapter has no children, it is a leaf node
  if (children.count() === 0) {
    return 1;
  }

  // Recursively navigate tree and tally up count of leaf nodes
  return children.reduce((leafNodeCount, childChapter: Chapter) => {
    return leafNodeCount + countLeafNodes(childChapter);
  }, 0);
}

/**
 * Takes a node in a chapter tree and returns leaf nodes reachable from it.
 *
 * @param chapter Chapter node from which to start
 * @returns Leaf nodes as a flat list
 */
export function getLeafNodes(chapter: Chapter): List<Chapter> {
  // Get children of given chapter
  const children = chapter.get("children") as List<Chapter>;

  // If chapter has no children, return it wrapped in a list
  if (children.isEmpty()) {
    return List([chapter]);
  }

  // Recursively navigate tree and combine leaf nodes in a flat list
  return children.reduce((leafNodes, childChapter: Chapter) => {
    return leafNodes.concat(getLeafNodes(childChapter));
  }, List([]));
}

/**
 * Returns the number of levels in a tree of chapters starting from the given
 * level.
 *
 * @param chapters List of tree nodes from which to start
 * @returns The number of levels in the tree
 */
export function getTreeHeight(chapters: List<Chapter>): number {
  // If given list is empty, tree has height 0
  if (chapters.count() === 0) {
    return 0;
  }

  // Recursively navigate tree and tally up level count
  return chapters.map((childChapter: Chapter) => {
    return 1 + getTreeHeight(childChapter.get("children") as List<Chapter>);
  }).max()!;
}

/**
 * Parses a query string returns the parsed values in a map.
 *
 * @param query The query string to parse
 * @returns A map containing the parsed values as key-value pairs
 */
export function parseQueryString(query: string): Map<string, string | undefined> {
  // Initialise empty map for storing results
  let result = Map<string, string | undefined>();

  // Split string using '&' as delimiter and start parsing entries
  query.split("&").forEach((pair) => {
    // Split pairs using '=' as delimiter
    const [key, val] = pair.split("=");

    // Sanitise key and value strings
    const sanitisedKey = key.replace(/[^a-zA-Z0-9_-]/g, "");
    const sanitisedVal = (val) ? decodeURIComponent(val) : val;

    // Make sure key string is non-empty
    if (sanitisedKey.length > 0) {
      result = result.set(
        sanitisedKey,
        sanitisedVal
      );
    }
  });

  return result;
}

/**
 * Shortens a given URL and returns a promise for the shortened URL.
 *
 * @param originalUrl URL to shorten
 * @returns A promise which should resovle to the shortened URL
 */
export async function shortenUrl(originalUrl: string): Promise<string> {
  // Construct data for request and send it
  const data = JSON.stringify({ longUrl: originalUrl });
  const response = await makeRequest("POST", "/shorturl", data, "application/json");
  // Response contains id of shortened URL
  const { id } = JSON.parse(response);

  // Return shorturl with ID
  return `${location.protocol}//${location.host}/shorturl/${id}`;
}

/**
 * Validates a layout document against a schema. If the layout validates
 * correctly, the function returns void, otherwise it will throw an error.
 *
 * @param layout The layout to validate
 */
export async function validateLayout(layout: any) {
  // Retrieve and parse schema for layout
  const data = await makeRequest("GET", "/static/dist/v4-document-schema.json");
  const schema = JSON.parse(data);

  // Validate given layout against schema
  const result = validate(layout, schema);

  // Throw error if schema is invalid
  if (!result.valid) {
    throw result.errors;
  }
}

/**
 * Takes a ref to a Konva Stage component and two numbers representing absolute
 * positions on the screen and returns the coordinates for the same point but
 * relative to the top-left corner of the Stage instead of the screen. Throws
 * an error if the Stage ref is null.
 *
 * @param stageWrapper Ref to a Stage component
 * @param pageX Absolute x position on screen
 * @param pageY Absolute y position on screen
 * @returns The [x,y] coordinates relative to the top-left corner of the given Stage
 */
export function getCanvasDropPosition(stageWrapper: Nullable<Stage>, pageX: number, pageY: number) {
  // Throw error if stage ref is null
  if (!stageWrapper) {
    throw new Error("Stage ref is null");
  }

  // Get stage object from ref and get absolute container position on screen
  const stage = stageWrapper.getStage();
  const { offsetLeft, offsetTop } = stage.container();

  // Subtract offsets from given coords
  return [
    pageX - offsetLeft,
    pageY - offsetTop
  ];
}

/**
 * Compares two arrays element by element and returns whether they are equal or
 * not.
 *
 * @param a First array
 * @param b Second array
 * @returns True if the arrays are equal, false otherwise
 */
export function arraysEqual<T>(a: Array<T>, b: Array<T>): boolean {
  // If array lengths are different, arrays are not equal
  if (a.length !== b.length) {
    return false;
  }

  // Iterate over arrays and compare elements pairwise
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Takes a chapter node and visits all its children, investigating their
 * timelines, merging them along the way, resulting in a single timeline which
 * represents the global timeline view seen from the given chapter as it would
 * be rendered in a standard non-linear video editor.
 *
 * @param chapter Chapter to merge the timelines for
 * @param timelines A list of timelines associated to the chapter nodes
 * @returns The current chapter's timeline merged with all descendant timelines
 */
export function mergeTimelines(chapter: Chapter, timelines: List<Timeline>): Timeline {
  // Find timeline for given chapter
  const chapterTimeline = timelines.find((t) => t.chapterId === chapter.id) || new Timeline();

  // If chapter has no children, no merging needs to be done
  if (!chapter.children || chapter.children.isEmpty()) {
    return chapterTimeline;
  }

  // Initialise final merged timeline to timeline of current chapter
  let mergedTimeline = chapterTimeline;

  // Get ids of descendants of current chapter as a flat list
  const chapterIds = getDescendantChapters(chapter).map((c) => c.id);
  // Retrieve timelines for each descendant
  const affectedTimelines = timelines.filter((t) => chapterIds.contains(t.chapterId));

  // Get all region IDs in all timelines affected by the merge
  const regionIds = affectedTimelines.reduce((regions, t) => {
    return regions.union(t.timelineTracks!.map((track) => track.regionId));
  }, Set<string>());

  // Create a new empty, locked track for each region affected by the merge
  regionIds.forEach((regionId) => {
    mergedTimeline = mergedTimeline.update("timelineTracks", (tracks) => {
      return tracks!.push(new TimelineTrack({
        id: "",
        locked: true,
        regionId,
        timelineElements: List([])
      }));
    });
  });

  // Inspect all children of current level and merge their timelines
  chapter.children.forEach((chapter) => {
    // Call function recursively on child chapter
    const childTimeline = mergeTimelines(chapter, timelines);
    // Get duration of merged timeline
    const duration = getTimelineLength(childTimeline);

    // Update tracks of final merged timeline
    mergedTimeline = mergedTimeline.update("timelineTracks", (tracks) => {
      return tracks!.map((track) => {
        // Check whether there is a track for the given region in the merged child timeline
        const childTrack = childTimeline.timelineTracks!.find((t) => t.regionId === track.regionId);

        if (childTrack) {
          // Sum duration of all elements in timeline track
          const elementDuration = childTrack.timelineElements!.reduce((sum, e) => sum + e.offset + e.duration, 0);

          // If summed duration is 0, track only has a single element without fixed
          // duration. Copy this element to the corresponding track in the final timeline
          if (elementDuration === 0) {
            const first = childTrack.timelineElements!.first()!;

            return track.update("timelineElements", (elements) => elements!.push(new TimelineElement({
              id: first.id,
              componentId: first.componentId,
              duration: duration,
              offset: 0,
              previewUrl: first.previewUrl
            })));
          }

          // If elements have non-zero length, add them to the corresponding
          // track in the final timeline
          return track.update("timelineElements", (elements) => {
            elements = elements!.concat(childTrack.timelineElements!);

            if (elementDuration < duration) {
              elements = elements.push(new TimelineElement({
                id: "",
                componentId: "",
                duration: 0,
                offset: duration - elementDuration
              }));
            }

            return elements;
          });
        }

        // If no child track exists, simply add a 'ghost' element to the track
        // in the final timeline to reserve the space
        return track.update("timelineElements", (elements) => elements!.push(new TimelineElement({
          id: "",
          componentId: "",
          offset: duration,
          duration: 0
        })));
      });
    });
  });

  // Update the tracks in the final timeline and replace tracks which already
  // exist in the current chapter
  mergedTimeline = mergedTimeline.update("timelineTracks", (tracks) => {
    return tracks!.map((track) => {
      const chapterTrack = chapterTimeline.timelineTracks!.find((t) => t.regionId === track.regionId);

      if (chapterTrack) {
        return chapterTrack;
      }

      return track;
    });
  });

  // Get total length of merged timeline
  const mergedLength = getTimelineLength(mergedTimeline);

  return mergedTimeline.update("timelineTracks", (tracks) => {
    return tracks!.map((track) => {
      // Check length of all tracks in the final timeline
      const trackLen = track.timelineElements!.reduce((sum, e) => sum + e.duration + e.offset, 0);

      // Pad length of tracks with 'ghost' elements which are shorter than the
      // duration of the merged timeline
      if (trackLen < mergedLength) {
        return track.update("timelineElements", (elements) => elements!.push(new TimelineElement({
          id: "", componentId: "", duration: 0, offset: mergedLength - trackLen
        })));
      }

      return track;
    });
  });
}

/**
 * Returns the length of a timeline by summing up durations and offsets of all
 * its timeline elements on all its tracks. The function thenreturns the length
 * of its longest track
 *
 * @param timeline The timeline for which we went to know the length of
 * @returns The duration of the longest track in the timeline
 */
export function getTimelineLength(timeline: Timeline | undefined): number {
  if (timeline) {
    // Map over all tracks and return duration of longest track
    return timeline.timelineTracks!.map(({ timelineElements }) => {
      // Sum all durations and offsets of timeline elements
      return timelineElements!.reduce((sum, e) => sum + e.offset + e.duration, 0);
    }).max() || 0;
  }

  return 0;
}

/**
 * Returns the total duration of the given chapter. This is calculated by
 * getting the timeline length of the current chapter and then recursively
 * visiting all children and summing up their timeline lengths. The result is
 * the duration of the chapter taking the durations or its descendants into
 * account.
 *
 * @param chapter The chapter for which we want to get the duration
 * @param timelines Timelines associated to the given chapter nodes
 * @returns The duration of a chapter taking into account durations of descendants
 */
export function getChapterDuration(chapter: Chapter, timelines: List<Timeline>): number {
  // Find timeline associated with chapter
  const timeline = timelines.find((t) => t.chapterId === chapter.id);
  const { children } = chapter;

  // Get summed duration of all children and return maximum
  return List([
    getTimelineLength(timeline),
    children!.reduce((sum, c) => sum + getChapterDuration(c, timelines), 0)
  ]).max() || 0;
}

/**
 * Calculates for each ancestor of the chapter accessible by `accessPath` the
 * offset that needs to be subtracted from the front of the timeline of said
 * ancestor to align it with the chapter given by `accessPath`. Returns a list
 * of tuples containing for each ancestor its access path, id and offset in
 * seconds.
 *
 * @param chapters Complete chapter tree
 * @param timelines List of timelines associated to the chapter tree
 * @param accessPath Acces path of the node to be investigates
 * @returns A list containing a tuple for each ancestor with id and offset
 */
export function getAncestorOffsets(chapters: List<Chapter>, timelines: List<Timeline>, accessPath: Array<number>, partialOffset = 0): List<[Array<number>, string, number]> {
  // If access path has length 1, we have no ancestors
  if (accessPath.length === 1) {
    return List().push([[], "", 0]);
  }

  let offsets = List<[Array<number>, string, number]>([]);

  // Get parent chapter
  const parentAccessPath = accessPath.slice(0, -1);
  const parentChapter = chapters.getIn(generateChapterKeyPath(parentAccessPath)) as Chapter;

  // Retrieve duration of chapters before the current chapter on the same tree level
  const parentOffset = parentChapter.children!.slice(0, accessPath[accessPath.length - 1]).reduce((sum, c) => {
    return sum + getChapterDuration(c, timelines);
  }, 0) + partialOffset;

  // Add duration as offset for parent to result and call function recursively
  // on said parent
  return offsets.push(
    [parentAccessPath, parentChapter.id, parentOffset]
  ).concat(
    getAncestorOffsets(chapters, timelines, parentAccessPath, parentOffset)
  );
}

/**
 * Returns the chapter that is obtained by navigating the tree using the values
 * in `accessPath` as indices.
 *
 * @param chapters Complete chapter tree
 * @param accessPath Access path of the chapter to retrieve
 * @returns The chapter found using the access path
 */
export function getChapterByPath(chapters: List<Chapter>, accessPath: Array<number>): Chapter {
  // Return chapter object directly given an access path
  return chapters.getIn(generateChapterKeyPath(accessPath));
}

/**
 * Cut a specified amount of seconds from the end of a given timeline track.
 * This is done by adjusting the durations and/or offsets of the elements
 * contained in the track. An empty track is returned unchanged.
 *
 * @param track Timeline track to be trimmed
 * @param end Time in seconds that should be trimmed off the end
 * @returns The timeline track trimmed to the given length
 */
export function trimBack(track: TimelineTrack, end: number): TimelineTrack {
  // If track has no elements, it does not need to be trimmed
  if (!track.timelineElements || track.timelineElements.isEmpty()) {
    return track;
  }

  let elements = List<TimelineElement>();
  let timeElapsed = 0;

  // Iterate over elements of current track
  for (let i = 0; i < track.timelineElements.count(); i++) {
    // Sum up elapsed time using element durations and offsets
    const e = track.timelineElements.get(i)!;
    timeElapsed += e.offset + e.duration;

    // If elapsed time is greater than trim time
    if (timeElapsed > end) {
      // Calculate difference between elapsed time and trim time
      timeElapsed -= e.offset + e.duration;
      let remaining = end - timeElapsed;

      // Adjust element duration accordingly if necessary
      if (remaining > 0 && remaining >= e.offset) {
        remaining -= e.offset;

        elements = elements.push(
          e.set("duration", remaining)
        );
      }

      break;
    }

    elements = elements.push(e);
  }

  // Update track with trimmed elements
  return track.set("timelineElements", elements);
}

/**
 * Cut a specified amount of seconds from the beginning of a given timeline
 * track. This is done by adjusting the durations and/or offsets of the
 * elements contained in the track. An empty track is returned unchanged.
 *
 * @param track Timeline track to be trimmed
 * @param start Time in seconds that should be trimmed from the beginning
 * @returns The timeline track trimmed to the given length
 */
export function trimFront(track: TimelineTrack, start: number): TimelineTrack {
  // If track has no elements, it does not need to be trimmed
  if (!track.timelineElements || track.timelineElements.isEmpty()) {
    return track;
  }

  let timeElapsed = 0;
  // Discard all elements before the trim time
  let elements = track.timelineElements.skipWhile((e) => {
    timeElapsed += e.offset + e.duration;
    return timeElapsed <= start;
  });

  // If there are no elements left, set the tracks elements to the empty list
  if (elements.isEmpty()) {
    return track.set("timelineElements", List());
  }

  // Get first element after the trim time
  const first = elements.first()!;
  timeElapsed -= first.duration + first.offset;

  // Check whether we need to adjust the first element's duration of offset
  if (start - timeElapsed > 0) {
    let remaining = start - timeElapsed;

    elements = elements.update(0, (e) => {
      // Update offset
      e = e.update("offset", (offset) => offset - remaining);

      // We also need to update the duration if the offset has become < 0
      if (e.offset < 0) {
        e = e.update("duration", (duration) => duration + e.offset).set("offset", 0);
      }

      return e;
    });
  }

  // Update track with trimmed elements
  return track.set("timelineElements", elements);
}

/**
 * Cut a specified amount of seconds from the beginning and end of a given
 * timeline track. This is done by adjusting the durations and/or offsets of
 * the * elements contained in the track. An empty track is returned unchanged.
 *
 * @param track Timeline track to be trimmed
 * @param start Time in seconds that should be trimmed from the beginning
 * @param start Time in seconds that should be trimmed at the end
 * @returns The timeline track trimmed to the given length
 */
export function trimTimelineTrack(track: TimelineTrack, start: number, end: number): TimelineTrack {
  // Calculate desired trim duration
  const duration = end - start;

  // If trim duration is < 0, return track unchanged
  if (duration < 0) {
    return track;
  }

  // Calculate current track duration based on element durations and offsets
  const trackDuration = track.timelineElements!.reduce((sum, e) => sum + e.duration + e.offset, 0);
  // Return track unchanged if it has no elements or no fixed duration
  if (track.timelineElements!.count() > 0 && trackDuration === 0) {
    return track;
  }

  // First trim the track from the front, then from the back and return the result
  return trimBack(trimFront(track, start), duration);
}
