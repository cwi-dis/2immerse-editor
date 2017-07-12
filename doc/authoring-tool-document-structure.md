# Document structure for authoring tool

Here are some preliminary ideas on the in-core document structure for the authoring tool.

## requirements

* it must be possible to store the whole project in a file (except the media items themselves, which will live on the asset repo or origin server and be referenced by URL). This includes all layout info, all events (or templates, or whatever), all chapter information, meat-information, etc.
* it must be possible to do live synchronisation of the project as it is edited with the timeline server (so we can use the normal 2immerse infrastructure for preview playback during editing).
* All the information in the document that is unimportant to the timeline server should be encoded in such a way that it doesn't interfere with its operation.
* it must be possible to save the project from the timeline server (so the _live triggering tool_ actions can be recorded, and the resulting project can later be tweaked in the authoring tool).
* the API used to synchronise the project from authoring tool to timeline server must also be usable between timeline server instances (so the _live triggering tool_ can talk to 1 single _master_ timeline service instance and if there are millions of viewers that master can broadcast the document modifications to all the viewers).

## background

In the timeline server, I am using a perfectly normal DOM implementation (ElementTree) to store the XML document that represents the timeline. That is the structure that I use for tree traversal, modification, etc. (and I think a similar paradigm may be usable for the authoring tool as well).

Each DOM element (only elements) has a `delegate` instance variable (I'm not using the word _attribute_ here because that is overloaded in an XML world) that contains all the implementation and volatile state that pertains to the timeline service. The delegate has a backpointer to the element, but is completely unconnected to the other delegates. (In other words: if a delegate of an element needs to access the delegate of the parent element, for instance because it has finished playback and wants to inform the parent, it goes to the DOM element, then to its parent, then to that elements delegate). This means that moving bits of the tree around doesn't have to worry about fixing up delegates and stuff: simple XML operations work.

To implement things like fast-forward or rewind I replace the `delegate` by a `delegateAdapter` that has  an `oldDelegate` (representing to old state of things) and a `newDelegate` (representing where we want to be) and that will slowly but surely modify the state of internal and external things until oldDelegate matches newDelegate and then simply disappear and replace itself by newDelegate).

Right now, some of the state in the delegate isn't truly volatile (or I'm not sure that it is volatile, or whatever:-), so before I do a DOM tree operation that could be visible externally (like "save to file") I give each delegate the chance to update any values in the DOM tree that it wants to save.

## Suggested document model

We use an authoring tool document structure that is basically an annotated timeline server document: a DOM tree with the `tl:` and `tic:` namespaces used just as in a "normal" timeline document. Additional information is stored in _elements_ that have a different namespace, such as `at:`, so they will be invisible to the timeline server. So, `/at:metadata` could contain all the metadata for the experience, `/at:events` could hold events, etc. 

> Additional information could also be stored in _attributes_ that have a different namespace, and there is no technical reason not to do so, but somehow I have the feeling this may not be a good idea. But I'm not quite sure why....

Anything under an invisible element will also be invisible to the timeline server, so we could store events as almost-normal timeline constructs under an element that as the `at:` namespace and the timeline server wouldn't see them.

All authoring tool functionality would be in the `delegate`, and there need not be a 1-1 mapping between element tag and delegate type (as there is in the timeline server, currently), so a `<tl:par>` that represents a chapter could have a different delegate implementation that a `<tl:par>` that is simply there because a dmappc needs a `<tl:sleep>` to limit its duration.