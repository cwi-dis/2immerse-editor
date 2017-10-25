+++
title = "Live Editing"
weight = 3
+++

# Support for the live editing tool

The basic principle behind the live editing - or triggering - tool is that the timeline document has pre-edited snippets for various events that can happen. These snippets can then be inserted into the timeline document, possibly after filling in some parameters. These snippets are called _events_, because that term seems to be closest to how television producers or directors think of them (even though the name has the disadvantage that it already means many different things in the technical domain).

The list of currently triggerable events and their parameters is retrieved from the backend authoring service, and the live editing tool will populate its GUI from this. This allows events to be active only during certain parts of the experience (which would make life easier for the person operating the live triggering tool). It may eventually also allow a second operator to edit new events into the live document as it is playing, using the preproduction tool operating on the live document.

We also want to modify events after they have been triggered (for example to manually stop an event by setting its ending time to "now"). This requires that the list of events is retrieved live.
## Requirements Considerations

There are various open issues in this document, that need to be filled from the requirements for the live editing tool:

- What are the parameters we need to be able to change on events when triggering them? What are the UIs needed for them and how should the preproduction author specify these?
- How should we specify points in time, i.e. from which origin?
- This design assumes that layout changes are not needed. Is that reasonable?
- There may be interaction with the _bookmarking_ functionality, for example to facilitate marking a time instance and later using that bookmark to insert a replay event.

We need to get these clear, with input from Andy and possibly Jonathan and Martin. We also need to get a general go-ahead that this is on the right track, both from a requirements point of view and an implementation point of view.

## Triggering Tool API

The triggering tool API endpoint is `/api/v1/document/<documentId>/events`

- method `GET` retrieves a list of the current triggerable, proposed and modifyable items as a JSON object. No parameters. Events are triggerable when they are not active yet and have parameters for which the user must supply a value. Proposed events are similar but have all their parameters already filled in. When triggered, a copy is made, with a new name, and this event is inserted into the timeline of the document. The copy may be modifyable.

  The return value entries have the following structure (all parameters are strings unless otherwise noted):

	- `name`: Human-readable name for the trigger (only for the UI).
	- `verb`: Human-readable string for the UI to put in the trigger button. Defaults to _Trigger_.
	- `modVerb`: Human-readable string for the UI to put in the modify button. Defaults to _Modify_.
	- `previewUrl`: optional URL of an image that can be used as a preview icon, so the trigger tool operator can quickly distinguish the various triggerable events.
	- `longdesc`: optional text that is shown to the trigger tool operator to help understand what the intention of this trigger is.
	- `id`: trigger identity, to be passed to the `trigger` call later.
	- `trigger`: (boolean) true if this item can be passed to `trigger` currently.
	- `modify`: (boolean) true if this item can be passed to `modify` currently. Note that exactly one of `trigger` and `modify` will be true for any event.
	- `parameters`: list of parameters, of the form:
		- `name`: Human-readable name for the parameter (only for the UI).
		- `parameter`: parameter identity, to be passed to the `trigger` or `modify` call later.
		- `type`: type of the parameter (string), see below.
		- `value`: optional default value (or some other object, based on `type`).
		- `required`: if true, this parameter must be filled in by the tool operator before the trigger/modify button is enabled.

- `trigger` (method `POST`) triggers a triggerable item. Returns a success indicator. The body is an `application/json` object, with the following keys:
	- `id`: the item to trigger (string)
	- `parameters`: list of `parameter`, `value` pairs (strings)
	
- `propose` (method `POST`) is very similar to trigger, but in stead of the event copy being inserted into the timeline it is inserted into the 

- `modify` (method `PUT`) modifies a previously triggered item. Returns a success indicator.   The body is an `application/json` object, with the following keys:
	- `id`: the item to trigger (string)
	- `parameters`: list of `parameter`, `value` pairs (strings).

The intention of the `type` field is to help populate the UI in a meaningful way (and allow this to be specified in the preproduction tool). I imagine the following types (and behaviours) but this needs to be driven by the requeirements:

- `"set"` a value to be set (from the `tt:value` attribute) without user interaction (and not presented to the user).
- `"string"` general text entry field, basically the default catch-all.
- _(not implemented or fully designed yet)_ `"time"` a point in time. Probably an integer. The UI should probably have buttons like  `Now` or `In 10 seconds` or so. What this value means (relative to current clock, or beginning of presentation, or something else) needs to come out of the requirements.
- _(not implemented or fully designed yet)_ `"duration"` a duration. Probably in seconds. Should probably have a button _Indefinite_ in the UI, and maybe a button `Default` if the item triggered has a natural duration (for example a prerecorded video clip).
- _(not implemented yet)_ `"selection"` should have a list of objects with `label` and `value` strings, where the user selects one of the labels and the corresponding value is returned. 
- _(not implemented or fully designed yet)_ `"url"` a url. This may need more functionality, so we can present the triggering tool operator with nice names like _Rossi bikeCam_ or _Home Team Reverse Angle_ in stead of them having the type in horribly long URLs. But maybe that can be handled with the `"choice"` type.
- _(not implemented or fully designed yet)_ `"bool"` a boolean, probably based on a checkmark or something.
- Maybe we need a way to specify a `bookmark`, a point in time which was previously setduring the live playback. Details (such as whether a bookmark implicitly refers to the main video, or is just a point in time so it can be used to pull in videos from different angles) need to be worked out.

Note that a lot of this depends on the requirements for the live triggering tool. For example, it may also be needed to have radio buttons or popups or such that can be populated with name/value pairs during preproduction.

### Callbacks

Currently the trigger tool frontent polls the backend periodically to refresh the list of current events. In future, we may want a callback mechanism.

## Timeline Document Considerations

The events will be `<tl:par>` or `<tl:seq>` elements in the timeline document with an `xml:id` attribute to address them. The events will be hidden from the timeline service by putting them in a `<tt:events>` or `<tt:completeEvents>`. The distinction between the two is that _complete events_ are expected to have all their parameters filled in already and can be instered into the document at the press of a button, where _events_ have some holes to be filled in, after which a `propose` call will copy them to the _complete events_.

The general structure of an event that always runs to completion is as follows:

```
<tl:seq tt:name="..." xml:id="..." >
    <tt:parameters>
        <tt:parameter tt:name="begin time" tt:parameter="tl:sleep/@tl:dur" tt:type="set" tt:value="{tt:clock(..)}" />
    </tt:parameters>
    <tl:sleep tl:dur="0" />
    <tl:par>
        ... real content ...
    </tl:par>
</tl:seq>
```

The general structure of an event that can be stopped interactively is as follows:

```
<tl:seq tt:name="..." xml:id="..." >
    <tt:parameters>
        <tt:parameter tt:name="begin time" tt:parameter="tl:sleep/@tl:dur" tt:type="set" tt:value="{tt:clock(..)}" />
	</tt:parameters>
	<tt:modparameters>
	    <tt:parameter tt:name="duration" tt:parameter="tl:par/tl:sleep/@tl:dur" tt:type="set" tt:value="{tt:clock(.)}" />
	</tt:modparameters>
    <tl:sleep tl:dur="0" />
    <tl:par>
    	<tl:sleep tl:dur="99999" />
        ... real content ...
    </tl:par>
</tl:seq>
```

An event has a `tt:name` attribute and a `<tt:parameters>` child element (with `<tt:parameter name= parameter= type= required= />` children).  An event has optional attributes `tt:target` (XPath indicating where the copy should be inserted), `tt:verb`, `tt:modVerb`, `tt:longdesc` and `tt:previewUrl`.

There is a second set of parameters `<tt:modparameters>` to signify the parameters that can be changed with _modify_ (which is probably a different set of parameters than those for _trigger_).

The `value` can be an _Attribute Value Template_, in which case the expression is evaluated and the result stored in the attribute to be modified.

At the moment, exactly two AVTs are implemented (hardcoded), to record current time point and duration and another one to refer to the value entered by the user (the default). These are used to set the `tl:dur` attribute of `tl:sleep` elements dynamically. See the examples above for how to use these:

- `{tt:clock(..)}` refers to the current clock value progress of the parent element. This corresponds roughly to the current time in the presentation.
- `{tt:clock(.)}` refers to the current clock value progress of the current element. This corresponds roughly to the current duration of the current element.
- `{tt:value()}` refers to the value entered by the trigger tool operator. This can be used to (slightly) modify the value before it is stored into the receiving attribute.

The `tt:parameter` attribute can be a relative XPath expressions pointing to the attribute to be modified. If `tt:parameter` is missing there can be multiple `tt:destination` children, each with `tt:parameter` and `tt:value` attributes, which allows storing the resultant value in multiple places.

On `trigger`, the whole event is copied and its `xml:id` is replaced by a new unique id. All parameter values are filled in. Then the new element is inserted into the timeline as a new child of the parent of the `<tt:events>` element.

The new element (with its new ID) will now show up in the `get` return value, with `trigger=false` and `modify=true`. It will disappear from there whenever its natural duration is done.

The parameter structure for types _choice_ and _bool_ still needs to be defined, probably with some form of indirection. These could then also be used to set multiple parameters at the same time (such as _mediaUrl_ and _auxMediaUrl_ for video elements).

### Timeline service coordination

The trigger tool backend needs to coordinate with the timeline service: 

- The timeline service needs to tell when elements become active and inactive, so the backend can adapt the set of triggerable and modifyable events.
- The timeline service needs to tell the backend the current clock values of certain elements, so the backend can insert the correct values for the `{tt:clock(.)}` and `{tt:clock(..)}` time values.

When synthesizing the document for the timeline service, the backend inserts the attribute `tt:wantstatus="true"` on all elements for which it wants status and timing updates.

The timeline service now reports `tls:state` and `tls:progress` for those elements (regularly, or whenever they have changed).

The backend stores these on its internal representation of the elements (after converting the progress to a `tls:epoch` that represents start time of the element, so current time of the element can be recomputed later).

## Preproduction Tool Considerations

An event is a perfectly normal bit of timeline document, only with the `tt:` bits added. It can probably be edited normally in the timeline editor (with all parameters given their default values by the author of the document).

Then there's some extra functionality that allows the author to specify which are the parameters and their names and all that.



