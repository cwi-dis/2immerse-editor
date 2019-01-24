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

/**
 * Represents an a media asset or DMApp component as received via REST from the
 * API. Contains a unique ID, a name, a description, an URL to a preview image
 * and a duration. This duration may not be negative, but may be 0 or 999999,
 * which represents a media item with no intrinsic duration, e.g. a livestream.
 */
export interface Asset {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  duration: number;
}

/**
 * An area represents a segment of a preview screen and has a coordinate for
 * the top-left corner of the screen and a width and height. This implies that
 * areas are always rectangular. Moreover, these coordinates are given as
 * fractions of the total screen size, i.e. they will be in the range [0, 1].
 * An area also has a key `region`, which associates it to a logical region by
 * means of an ID. The associated region gives the area a name and a colour.
 * The reason for this is that a region can exist on multiple screens and can
 * have different sizes but still must contain the same media items.
 */
export interface Area {
  region: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Represents a preview device. A preview device has a name, a type, which can
 * either be `communal` (e.g. a TV) or `personal` (e.g. a mobile phone), an
 * orientation (`portrait` or `landscape`) and a list of areas, representing
 * subdivisions of the screen which can contain media assets. These areas may
 * be overlapping and areas are rendered by their index in ascending order, i.e.
 * the last area in the list will be rendered on top of all other areas on the
 * screen.
 */
interface Device {
  name: string;
  type: "communal" | "personal";
  orientation: "portrait" | "landscape";
  areas: Array<Area>;
}

/**
 * A virtual region which has a unique ID, a name and a background colour. A
 * region can be represented on multiple screens by associating it to them
 * through an area. See the documentation for `Area` for more information.
 */
export interface Region {
  id: string;
  name: string;
  color: string;
}

/**
 * A layout ties together multiple preview screens and regions. The regions are
 * associated to devices through areas by means of unique IDs.
 */
export interface Layout {
  devices: Array<Device>;
  regions: Array<Region>;
}

/**
 * Represents an assets which is associated to a timeline track. It is tied to
 * the assets by means of an unique ID. Moreover, an element has a duration,
 * which can override the asset's intrinsic duration and an offset from the
 * previous element on the timeline track, or from the beginning of the track
 * if it is the first element.
 */
interface Element {
  asset: string;
  duration: number;
  offset: number;
}

/**
 * A timeline track associated to a region by ID. Normally, each region will
 * have zero or one timeline track, but not more than one. The track also
 * contains a list of elements, which are intended to be played one after the
 * other, taking into account their durations and offsets.
 */
interface Track {
  id: string;
  region: string;
  elements: Array<Element>;
}

/**
 * A recursive data structure representing the hierarchical structure of a
 * programme as a tree. Each node in the tree has a unique ID, a name a list
 * of tracks containing the media elements and a list of child nodes, which are
 * intended to be played out in ascending order one after the other.
 */
export interface ChapterTree {
  id: string;
  name: string;
  tracks: Array<Track>;
  chapters: Array<ChapterTree>;
}
