+++
title = "Technical Overview"
weight = 3
+++

# 2IMMERSE Production Tools Technical Overview

This document describes the technical decisions taken for the development of
the 2IMMERSE Production Tools and the architecture which shall be used in the
development of such tools.

## Outline

For the 2IMMERSE project, a set of production tools is required for the
development of interactive multi-screen experiences. To this end, based on
requirements gathered from media industry professionals and a series of
UI approaches we have devised the following structure for the productions
tools. Coarsely, the application can be divided into the following layers:

- *Server backend*: Acts as point of interaction between the frontend, the
  database and the rest of the 2IMMERSE infrastructure. This layer is comprised
  of a simple HTTP server written in Python. If support for collaboration shall
  be integrated, this needs to provide WebSocket handling as well.
- *Frontend*: The frontend will be the place where most of the business logic
  is located. The frontend shall be responsible for handling the UI and provide
  an intuitive way for arranging media items and DMApp components into
  interactive presentations. This will be implemented using the UI library
  React and Redux for data handling.
- *Preview Playback*: For preview playback, the already existing 2IMMERSE
  infrastructure shall be employed. The timeline documents emitted by the
  frontend editing tools shall be directly playable on the infrastructure.

The following sections will outline each of these layers in greater detail.

## Data Management

- *User*: All user related data, such as names, email addresses and potentially
  a hashed password. Will be provided by authentication service
- *MediaItem*: A media item stored somewhere in the infrastructure which can be
  integrated into a presentation. This entity stores the path/URL to the media
  item as well as its type and possibly other metadata such as its length.
- *Presentation*: Stores all information related to a presentation, this
  includes for instance the path to a timeline document.

Note that this list is by no means complete and merely represents the types of
entities which have been defined at this point in the development stage.
Further entities shall be added during the development process as the need
arises.

Authentication service + storing other data in namespaced timeline doc

## Backend

The backend is a standard HTTP server based on the Python mircoframework Flask,
which aims to act as an interface layer between the front end, the database
and the rest of the 2IMMERSE infrastructure. More specifically, the layer is
responsible for rendering out the basic HTML templates, handle user session
management and interacting with the database.

As an optional extension to the service, if collaborative real-time editing is
to be implemented, this layer also needs to provide support for WebSockets.
This can be realised by means of an asynchronous library such as Tornado. This
step, however, may necessitate reimplementing the Flask service in Tornado as
well to cope with multithreading issues.

The backend acts as a separation layer between the user interface and the
greater infrastructure. This is achieved by means of a client-server
architecture in which most of the actual business logic lives on the client
side which communicates with the data store and the preview playback
infrastructure through a REST interface. This separation of concerns and loose
coupling affords the possibility of separating the work cleanly between
multiple parties.

## Frontend

The frontend forms the main point of interaction for the user. It shall be
implemented as a rich browser application, which invokes the feel of a native
desktop application. The UI has been developed based on initial requirements by
means of an iterative process with media production experts. A series of
candidate prototypes has been created and evaluated to put together a final
UI prototype, which shall be implemented to completion. For this, a series of
detailed UI sketches is required, which outline every piece of functionality
desired to appear in the final application.

This final application shall provide an event-based way of creating interactive
media presentations. This is different from timeline-based editing in that it
does not provide frame-accurate editing support, but rather allows the user
to arrange the presentation in a hierarchical way. This very much reflects the
design of the timeline document, which allows for containers to be nested
recursively.

To implement a rich web application, the frontend employs the frontend library
React developed by Facebook and in use in Facebook Chat and Instagram. It
provides a component-based way of structuring the application. Each part of the
user interface is defined in terms of a component which can then be used and
reused much like a standard HTML tag inside the application. What's more to
these components though is that they can receive configuration parameters from
parent components and manage their own internal state and potential child
components.  Data flow within the application is strictly unidirectional from
parent to child components. This provides the assurance that each piece of data
is kept consistent within the entire application and there is a single
authoritative source of truth. React also makes sure that only those parts of
the DOM are updated, which did in fact change by employing a Shadow-DOM and
sophisticated diffing algorithm. In order to manage global application state
within the UI and provide a facility to emit and react to events, the
supplementary library Redux shall be used which implements a simplified version
of the Flux paradigm recommended by Facebook for the use together with React.

Further, in order to aid with the development of this rather complex UI
application, the project shall employ the use of TypeScript. TypeScript is
a superset of conventional ES6 JavaScript developed by Microsoft with the added
benefit of a strong type system. The idea is that compile-time type checking
will erase a source of bugs introduced by JavaScript's weak dynamic typing. The
type checker shall be put into strict null-checking mode, which provides an
additional safety net by forcing the developer to explicitly declare all values
which might be NULL or undefined as nullable in the application. Thus, evading
bugs which might arise from undefined values.

React and TypeScript cannot be run by any browser natively and thus require a
build toolchain to be put in place. This facility shall be provided by Webpack,
a pluggable module bundler. It will invoke the TypeScript compiler, which
checks all types in the application, resolve modules and imports and then
convert the React components to optimised JavaScript code and bundle them into
a single file.

## Preview Infrastructure

In order to take the most advantage of the existing 2IMMERSE infrastructure,
the frontend shall directly generate timeline documents which can be
interpreted and played by the timeline server. Thereby providing the most
convenient way for previewing presentations during and after the creation
process.

Issues to be taken into account with this approach include access control,
proper media management (i.e. upload, linking and storage) and concurrent work.
If a timeline document can be accessed by multiple parties at the same time,
some transactional update mechanism with the ability to resolve editing
conflicts must be put into place. Further, there must be assurances that the
timeline document slated for preview is valid according to the timeline
document specification and can be replayed correctly. In case of errors with
the timeline document itself, the layout, a media item or DMApp component,
there should be a way to debug the error.

Finally, the preview infrastructure must provide functionality to enable random
access, seeking and pausing of a previewed presentation. This is yet to be
implemented.

## User Stories

This section lists a tentative set of user stories to be completed in the
course of the development. This list is by no means complete and shall be
extended as new problem areas and feature sets are uncovered. Moreover they
are unordered and have as of yet no story points or priorities assigned.
However, care has been taken to minimise cross-cutting concerns across multiple
layers of the architecture.

As a user, I want to...

- log into the application with my username and password
- select a pre-existing template from a template library
- upload media items and graphical assets
- select DMApp components from an internal library
- configure DMApp components such that they suit my presentation
- be able to create a new presentation
- arrange media items and components sequentially on the timeline
- create and arrange chapters
- add media items and assets to a chapter
- preview my presentation
- pause, stop and have random access to any point in my presentation
- save my presentation for a later point in time
- assign media items a place in the layout
- add additional devices
- add graphical branding to my application
- insert placeholder components for live presentations
- save the current editing state of the presentation
- provide facilities for the final deployment of the presentation
- have support for the preparation of live presentation

As mentioned earlier, this list is very coarse in granularity and incomplete.
During development, the list shall be refined and extended.
