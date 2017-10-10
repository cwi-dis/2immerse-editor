+++
title = "Backend API"
weight = 3
+++

# Authoring tool backend API

Unless otherwise noted all calls use the GET verb.

## global calls
Toplevel api is at endpoint `/api/v1`, accepts following calls:

- POST, creates new document. Optional body with mimetype `application/xml` specifies initial content. If no present an optional `url` argument specifies where to load content from. If not present an empty document is created.

  Returns the `documentId` for the new document.
  
- GET, returns  all _documentId_ as a JSON list.

There is also a global endpoint `/api/v1/configuration` for the global configuration of the backend service:

- GET returns the current configuration variables as a JSON object.
- PUT accepts a JSON object and updates the configuration variables acordingly.

## per-document calls

Document api is at endpoint `/api/v1/document/<documentId>`. 

- GET returns complete document, as `application/xml`.
- PUT replaces complete document, either from body XML or from `url` parameter (as for toplevel POST).
- `save`. Saves document to `url` argument. Must be local file URL, for the time being (and you don't really know where local files reside:-).

## xml-oriented calls

There are some calls that operate on the whole XML authoring document. These may go away at some point, they may not be needed. They are at endpoint `/api/v1/document/<documentId>/<verb>`:

- `copy` (POST) Copy a subtree, returns the XPath of the new copy. Arguments:
	- `sourcepath` XPath to the source element.
	- `path` XPath to the destination element, where the new element is put with respect to the destination element depends on the _where_ argument.
	- `where` is one of:
		- `"begin"` as new first child.
		- `"end"` as new last child.
		- `"before"` as preceding sibling.
		- `"after"` as next sibling.
		- `"replace"` overwriting the destination.
- `move` (POST) Moves a subtree. Same arguments as `copy`, returns the new XPath of the element.
- `modifyData` (PUT) Replaces element textual data. Arguments:
	- `path` the XPath to the element to modify.
	- `data` the new data. If not specified the old data in the element is removed.
- `cut` removes element from the tree and returns it. Does not work at the moment because the API is weird.
- `paste` paste element into the tree and returns its XPath. Does not work at the moment because the API is weird. 
- `get` copies element from the tree and returns it. Does not work at the moment because the API is weird. 
- `modifyAttributes` changes element attribute values. Does not work at the moment because the API is weird.

## Authoring tool oriented calls

These provide an interface that is tailored to the preproduction authoring tool. The endpoint is at `/api/v1/document/<documentId>/author/<verb>`.

There aren't any calls, at the moment:-)

## document serving calls

The endpoint at `/api/v1/document/<documentId>/serve/` serves things like timeline and layout documents, generated on the fly form the underlying document representation:

- `timeline.xml` timeline server document (mimetype `application/xml`).
- `layout.json` layout server document (mimetype `application/json`).
- `layout.json` (PUT) replaces the layout server data in the document. This is a temporary call.
- `client.json` client-api configuration document (mimetype `application/json`). One optional argument:
	- `base` The URL of a base _client.json_ configuration document. Use this to select different timeline/layout server instances.
- `addcallback` (POST) register for callbacks on document changes. Arguments:
	- `url` the fully qualified URL to which callbacks are made. Callbacks are `PUT` with an `application/json` object that signal which changes have been made to the document (see below).

The _addcallback_ method is probably temporary. There needs to be a websocket or something so that the backend and the change consumer don't get out of sync.

## trigger tool calls

The endpoint at `/api/v1/document/<documentId>/events` is meant for the live triggering tool. Its API and data structures are described in [live\_tool\_support.md](live_tool_support.md).

## preview player calls

The endpoint at `/api/v1/document/<documentId>/preview` is a convenience endpoint that starts a 2immerse player for the current document (it returns a http-redirect to client-api, with the `inputDocument` parameter pointing to _serve/client.json_, described above). One optional argument:

	- `base` the URL of a base _client.json_ configuration document. Use this to select different timeline/layout server instances.

## remote control calls

The endpoint at `/api/v1/document/<documentId>/remote` is a remote control for the preview player attached to the document:

- `GET` returns the current playback status of the document as a JSON object with the following fields:
	- `status` (string) a message to present to the user.
	- `active` (boolean) true if a preview player is attached. If false the rest of the fields are not available.
	- `playing` (boolean) true if the document is playing, false if paused.
	- `position` (float) time position in seconds.
- `control` (POST) allows to control the preview player, argument is a JSON object. Fields are optional, missing fields means _no change_.
	- `playing` (boolean) set to `false` or `true` to pause or resume playback.
	- `position` (float) set absolute time position. _NOTE:_ this may not be fully implemented.
	- `adjust` (float) adjust time position by this amount.

## document changes

Each high level edit operation (through the trigger tool calls, the xml calls or the authoring tool calls) results in a sequence of low-level edit operations. This sequence can then be forwarded to other copies of the document (which will then be updated to be the same as the original).

The edit operations is a json object with the following key/value pairs:

- `generation` is an integer that is incremented with each change. The value is stored in the document itself, as a `au:generation` attribute on the root element. This allows consumers to see whether they need to apply the edit operations or whether their instance of the document already has them (and also detect missed edit operations).
- `operations` is a list of JSON objects, with the following key/value pairs:
	- `verb` string, one of `"add"`, `"delete"` or `"change"`.
	- `path` string, an XPath expression uniquely pointing at a single element in the document. This is the element to be deleted or changed, or relative to which the new element is added.
	- `where` string. For the _add_ operation, the relative position (with respect to the element pointed at by _path_) the new element is inserted. Can be `"after"` for next sibling, or `"begin"` for first child.
	- `data` string containing XML document fragment. For the _add_ operation, the element (and descendents) to be added to the document.
	- `attrs` string containing JSON object. For the _change_ operation, key/value pairs for the attributes to be set on the element. Must be a complete set of attributes (i.e. all current attributes will be removed).

The current implementation (and design) is clunky, and probably depends on sender and receiver being Python code using _elementtree_ as the DOM storage, how it encodes namespaces in attribute keys and possibly on the specific set of xml namespace prefixes in use.
