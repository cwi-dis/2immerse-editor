# Support for the live editing tool

The basic principle behind the live editing - or triggering - tool is that the timeline document has pre-edited snippets for various events that can happen. These snippets can then be inserted into the timeline document, possibly after filling in some parameters. These snippets are called _events_, because that term seems to be closest to how television producers or directors think of them (even though the name has the disadvantage that it already means many different things in the technical domain).

Ideally, the list of currently triggerable events and their parameters is retrieved from a service (possibly the timeline service, possibly the editing service), and the live editing tool will populate its GUI from this. This allows events to be active only during certain parts of the experience (which would make life easier for the person operating the live triggering tool). It may eventually also allow a second operator to edit new events into the live document as it is playing, using the preproduction tool operating on the live document.

An alternative (simpler) implementation is that the preproduction editing tool exports a list of the events.

_Open issue_ This document assume that we want to modify events after they have been triggered (for example to manually stop an event by setting its ending time to "now"). This requires that the list of events is retrieved live. Whether this is implemented should depend on the live tool requirements.

## Requirements Considerations

There are various open issues in this document, that need to be filled from the requirements for the live editing tool:

- Do we need the ability to modify events that are already running? Note that _stopping_ an event (for example an event that has an indefinite duration) is a special case of modifying.
- What are the parameters we need to be able to change on events when triggering them? What are the UIs needed for them and how should the preproduction author specify these?
- How should we specify points in time, i.e. from which origin?
- This design assumes that layout changes are not needed. Is that reasonable?
- There may be interaction with the _bookmarking_ functionality, for example to facilitate marking a time instance and later using that bookmark to insert a replay event.

We need to get these clear, with input from Andy and possibly Jonathan and Martin. We also need to get a general go-ahead that this is on the right track, both from a requirements point of view and an implementation point of view.

## Triggering Tool API

- `get` retrieves a list of the current triggerable and modifyable items as a JSON object. No parameters. Events are triggerable when they are not active yet. When triggered, a copy is made, with a new name, and this event may be modifyable.

  The return value entries have the following structure (all parameters are strings unless otherwise noted):

	- `name`: Human-readable name for the trigger (only for the UI).
	- `verb`: Human-readable string for the UI to put in the trigger or modify button. Probably defaults to _Trigger_ or _Modify_.
	- `id`: trigger identity, to be passed to the `trigger` call later.
	- `trigger`: (boolean) true if this item can be passed to `trigger` currently.
	- `modify`: (boolean) true if this item can be passed to `modify` currently. Note that exactly one of `trigger` and `notify` will be true for any event.
	- `parameters`: list of paremeters, of the form:
		- `name`: Human-readable name for the parameter (only for the UI).
		- `parameter`: parameter identity, to be passed to the `trigger` or `modify` call later.
		- `type`: type of the parameter (string), see below.
		- `value`: optional default value.
- `trigger` triggers a triggerable item. Returns a success indicator. Parameters:
	- `id`: the item to trigger (string)
	- `parameters`: list of `parameter`, `value` pairs (strings)
- `modify` modifies a previously triggered item. Returns a success indicator.  Parameters:
	- `id`: the item to trigger (string)
	- `parameters`: list of `parameter`, `value` pairs (strings).

The intention of the `type` field is to help populate the UI in a meaningful way (and allow this to be specified in the preproduction tool). I imagine the following types (and behaviours) but this needs to be driven by the requeirements:

- `"string"` general text entry field, basically the default catch-all.
- `"time"` a point in time. Probably an integer. The UI should probably have buttons like  `Now` or `In 10 seconds` or so. What this value means (relative to current clock, or beginning of presentation, or something else) needs to come out of the requirements.
- `"duration"` a duration. Probably in seconds. Should probably have a button _Indefinite_ in the UI, and maybe a button `Default` if the item triggered has a natural duration (for example a prerecorded video clip).
- `"url"` a url. This may need more functionality, so we can present the triggering tool operator with nice names like _Rossi bikeCam_ or _Home Team Reverse Angle_ in stead of them having the type in horribly long URLs. But maybe that can be handled with the `"choice"` type.
- `"const"` always set a fixed string value (from the `tt:value` attribute).
- _(not implemented or fully designed yet)_ `"bool"` a boolean, probably based on a checkmark or something.
- _(not implemented or fully designed yet)_ `"choice"` should have a list of name/value pairs, where the user selects one of the names and the corresponding value is returned. Or maybe just a list of labels, with the front end returning the index?
- Maybe we need a way to specify a `bookmark`, a point in time which was previously setduring the live playback. Details (such as whether a bookmark implicitly refers to the main video, or is just a point in time so it can be used to pull in videos from different angles) need to be worked out.

Note that a lot of this depends on the requirements for the live triggering tool. For example, it may also be needed to have radio buttons or popups or such that can be populated with name/value pairs during preproduction.

### Callbacks

We may want a callback mechanism so the timeline service (or production tool backend) can tell the live triggering tool that the list of triggers has changed. Aternatively, the triggering tool could poll.

## Timeline Document Considerations

The events will be `<tl:par>` elements in the timeline document with an `xml:id` attribute to address them. The events will be hidden from the timeline service by putting them in a `<tt:events>`. 

An event has a `tt:name` attribute and a `<tt:parameters>` child element (with `<tt:parameter name= parameter= type= />` children).  An event has optional attributes `tt:target` (XPath indicating where the copy should be inserted).

There is a second set of parameters `<tt:modparameters>` to signify the parameters that can be changed with _modify_ (which is probably a different set of parameters than those for _trigger_).

The `parameter` parameters can be relative XPath expressions pointing to the attribute to be modified.

On `trigger`, the whole event is copied and its `xml:id` is replaced by a new unique id. All parameter values are filled in. Then the new element is inserted into the timeline as a new child of the parent of the `<tt:events>` element.

The new element (with its new ID) will now show up in the `get` return value, with `trigger=false` and `modify=true`. It will disappear from there whenever its natural duration is done.

The parameter structure for types _choice_ and _bool_ still needs to be defined, probably with some form of indirection. These could then also be used to set multiple parameters at the same time (such as _mediaUrl_ and _auxMediaUrl_ for video elements).

## Preproduction Tool Considerations

An event is a perfectly normal bit of timeline document, only with the `tt:` bits added. It can probably be edited normally in the timeline editor (with all parameters given their default values by the author of the document).

Then there's some extra functionality that allows the author to specify which are the parameters and their names and all that.



