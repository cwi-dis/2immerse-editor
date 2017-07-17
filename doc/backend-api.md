# Authoring tool backend API

Unless otherwise noted all calls use the GET verb.

## global calls
Toplevel api is at endpoint `/api/v1`, accepts following calls:

- POST, creates new document. Optional body with mimetype `application/xml` specifies initial content. If no present an optional `url` argument specifies where to load content from. If not present an empty document is created.

  Returns the `documentId` for the new document.
  
- GET, returns  all _documentId_ as a JSON list.

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
- `client.json` client-api configuration document (mimetype `application/json`). 

## trigger tool calls

The endpoint at `/api/v1/document/<documentId>/events` is meant for the live triggering tool. Its API and data structures are described in [live\_tool\_support.md](live_tool_support.md).
