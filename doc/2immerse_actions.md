# Global application state

screens:
  - [
    {id, name, type, orientation, regions: [{id, position, orientation}]}
  ],
masters:
  - [
    {id, name, components: [{id, region_id, dmappc_id}]}
  ],
dmappc_templates:
  - [
    {id, reference, param_names: {...}}
  ],
dmappcs:
  - [
    {id, reference, params: {...}}
  ],
story_tree:
  - {id, name, master_id, children: [{id, name, master_id, children, ...}]}
chapters:
  - [
    {id, story_node_id, name, components: [{id, region_id, dmapp_id, duration, offset, event?}]}
  ]

# Central UI components

- Layout designer: Add screens and draw regions on them by clicking the screens.
  A click will split the screen in two regions. Unclear: How is orientation
  determined (maybe first click horizontal, second one vertical)?
- Master editor: Create new master layouts with name, add components to them
  and assign them to regions
- Story tree editor: Layout rough layout of story in hierarchical fashion.
  Master layouts applied to parent nodes apply to all children. Leaf nodes can
  be opened in sequence editor
- Sequence editor: Presents conventional timeline with one track for each
  region. DMApp components can be dragged onto the timeline and arranged
  sequentially with a defined duration and offset. Unclear: How is this handled
  in a live case, where many components don't have duration and/or offset.
  Masters are displayed greyed out on the tracks they are assigned to.
  Components can also be triggered by events. Elements may have
  interdependencies which are not immediately obvious from the UI (e.g. video
  clip has set duration, static component derives duration from video; change
  in video duration has effect on duration of static component).

# Server side

- Events related to modifcation of timeline document are forwarded to server
- Server its own copy of internal timeline representation
- Internal representation is converted to timeline format, which can be played
  by preview infrastructure

# Events

ADD_DEVICE: add new screen
  name, type (personal|communal)
REMOVE_DEVICE: delete an existing screen
  id

SPLIT_REGION: split currently selected screen region in two at the current position
  orientation (horizontal|vertical), width, screen_id
DELETE_REGION: delete currently selected region
  screen_id

CREATE_MASTER: create new master layout
  name
DELETE_MASTER: delete existing master
  master_id
ADD_COMPONENT_TO_MASTER: adds a new DMapp component to a master
  dmapp_id, region_id

CREATE_STORY_TREE_NODE: create new story tree node in isolation
  name, ...
ASSIGN_STORY_TREE_NODE: assign existing node to parent
  parent_node
DETACH_STORY_TREE_NODE: detach node from parent node.
  node_id
DESTROY_STORY_TREE_NODE: destroy referenced node. also destroys children
  node_id
APPLY_MASTER_TO_STORY_NODE: apply a master layout to a story tree node
  node_id, master_id
REMOVE_MASTER_FROM_NODE: remove a master layout from a tree node
  node_id, master_id
EDIT_CHAPTER: edit timeline of a leaf node in sequence editor
  node_id

ADD_COMPONENT_TO_REGION: add a dmapp component to region at given position with given duration and offset
  region_id, dmapp_id, duration, offset, position
REMOVE_COMPONENT_FROM_REGION: remove a component from a timeline track
  dmapp_id
