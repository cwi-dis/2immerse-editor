# 2IMMERSE editor - Live Triggering

The 2IMMERSE Editor has an option for live triggering events that are embedded in a timeline document. The live triggering is recorded and the resulting experience can be stored in a copy of the document that can be used to replay the experience created in this way.

### Preparing your timeline document

For use with the trigger tool your timeline document must have _layout.json_ and bits of _client.json_ included in the timeline document. Your document must also include triggerable events.

For a terse description of the XML needed for this see [docs/live\_tool\_support.md](docs/live_tool_support.md) or look at the example in `technical-samples/301-motogp-events`.

## Starting the tool

The 2IMMERSE Editor does not require installation, simply start up the web application:
<https://2immerse-editor-edge.platform.2immerse.eu/>

This will bring up the entry page that shows two options, `Preproduction Authoring` and `Live Triggering`.

(You will also find an option for advanced users to change the configuration. This can be used to change services and other features. Please be careful with this: for the time being it will change the settings for all users of the authoring tool)

Select `Live Triggering`.
This brings up a webpage with three buttons at the top on the righthand side, `Launch Preview`, `Save Document` and `Clear Session`.

For your convenience the tool will automatically load the previous session. For a new start you click on the button `Clear Session`.  You may also have to do this when the tool opens with an error message about an unknown document (this can happen when services have been restarted since your last session).

##Upload the timeline document

`Clear Session` activates a dialog to specify an upload method. For this there are three options: `File upload`, `URL` or `Document ID`.

If you have a local file you select `File upload` and use the file selector. If you want to use a document on a server select `URL` and, if the default is not appropriate, specify the webdocument you want to upload.

Select your timeline document and hit `Continue`.

This brings you back to the previous page, now showing all events that are embedded in the document that has been uploaded.

## Start triggering

To start the triggering process you first have to bring up a webpage for preview playout. This is done by hitting the `Launch Preview` button on top of the control page. Doing so will allow you to open a preview using one of three methods:

- On a mobile device (by pointing your camera at the QR-code and opening the resulting URL).
- Open a new tab for preview, then drag this tab to a second screen or any other position on your screen so that you have a clear view on both the preview page and the control page.
- By typing the shortened URL into any 2immerse-compatible device (such as a NUC).

You will find this will automatically start the playout of the experience as specified in the document that has been uploaded.

In the control page you will find all events that are available in the document. These events may or may not have a parameter, for instance to specify the duration of the event. Specify this parameter before you actually trigger the event. For certain events you may want to do that before bringing up the preview.

By hitting the `Trigger` button of an event you will activate that event and immediately see the result in the preview. The relative time you press a button is recorded to be able to produce a timeline document that can replay the experience including the events that have been triggered.

There is a second tab `triggered events` where you can stop events again.

### Preview control

Once the preview player has started the preview control buttons on the bottom of the editing window become active. These buttons allow you to control the preview player:

- Go back 5 seconds
- Go back 1 video frame
- Play
- Pause
- Go forward 1 video frame

This allows fine control over where events are inserted into the timeline document.

To the right of the playback controls, you should see the current timecode. At the moment, this field is only updated once a second. Another issue is that when pausing the stream, the counter does not stop, even if the presentation is paused successfully. It will, however, reset to the correct timecode once you press play again.

To the left of the playback there is a field which displays status messages from the server. Once playback is started, this field should usually be clear. Note that most messages will be truncated. Hover over the the text to see the full message.

### Multi-user

A future version of the tool will have filling in of parameters and actual triggering/stopping as two separate tabs. It will then be possible to do the editing with two people:

- Person 1 opens the timeline document by URL
- Person 2 notes the _Document ID_ and opens the document by ID.

One person can now fill in the parameters to the events and _Propose_ the event. The other person can start and stop the proposed events. This is supposed to create a workflow similar to the replay editors and main director.

## Save the experience

When you completed running the experience you can create a document of the experience including all triggered events by hitting the `Save Document` button. This will automatically start a download of that ducument on your computer.

To verify your effort you can rerun the experience including triggered events using this tool. Simply clear the session and upload the document that has been downloaded on your computer. Hit `Launch Preview` and sit back and watch the show. In principle you can use such a rerun to trigger additional events and create an updated document.

