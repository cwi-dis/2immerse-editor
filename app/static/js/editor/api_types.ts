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

export interface Asset {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  duration: number;
}

export interface Area {
  region: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Device {
  name: string;
  type: "communal" | "personal";
  orientation: "portrait" | "landscape";
  areas: Array<Area>;
}

export interface Region {
  id: string;
  name: string;
  color: string;
}

export interface Layout {
  devices: Array<Device>;
  regions: Array<Region>;
}

interface Element {
  asset: string;
  duration: number;
  offset: number;
}

interface Track {
  id: string;
  region: string;
  elements: Array<Element>;
}

export interface ChapterTree {
  id: string;
  name: string;
  tracks: Array<Track>;
  chapters: Array<ChapterTree>;
}
