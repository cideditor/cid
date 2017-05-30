import { WINDOW_TYPE } from '@cideditor/cid/reducers/windowRegistry';

export const WINDOW_MOVE_ACTIVE_LEFT = `WINDOW_MOVE_ACTIVE_LEFT`;
export const WINDOW_MOVE_ACTIVE_RIGHT = `WINDOW_MOVE_ACTIVE_RIGHT`;
export const WINDOW_MOVE_ACTIVE_UP = `WINDOW_MOVE_ACTIVE_UP`;
export const WINDOW_MOVE_ACTIVE_DOWN = `WINDOW_MOVE_ACTIVE_DOWN`;

// ---

export const WINDOW_SET = `WINDOW_SET`;
export const windowSet = (window) => ({ type: WINDOW_SET, window });

export const WINDOW_UNSET = `WINDOW_UNSET`;
export const windowUnset = (windowId) => ({ type: WINDOW_UNSET, windowId });

export const CONTAINER_SET = `CONTAINER_SET`;
export const containerSet = (container) => ({ type: CONTAINER_SET, container });

export const CONTAINER_UNSET = `CONTAINER_UNSET`;
export const containerUnset = (containerId) => ({ type: CONTAINER_UNSET, containerId });

export const VIEW_SET = `VIEW_SET`;
export const viewSet = (view) => ({ type: VIEW_SET, view });

export const VIEW_UNSET = `VIEW_UNSET`;
export const viewUnset = (viewId) => ({ type: VIEW_UNSET, viewId });

// ---

export const DIALOG_OPEN = `DIALOG_OPEN`;
export const dialogOpen = (component) => ({ type: DIALOG_OPEN, component });

export const DIALOG_CLOSE = `DIALOG_CLOSE`;
export const dialogClose = () => ({ type: DIALOG_CLOSE });

// ---

export const WINDOW_KILL = `WINDOW_KILL`;
export const windowKill = (windowId) => ({ type: WINDOW_KILL, windowId });

export const WINDOW_SPLIT = `WINDOW_SPLIT`;
export const windowSplit = (windowId, { splitType = WINDOW_TYPE.ROW } = {}) => ({ type: WINDOW_SPLIT, windowId, splitType });

// ---

export const WINDOW_SET_ACTIVE = `WINDOW_SET_ACTIVE`;
export const windowSetActive = (windowId) => ({ type: WINDOW_SET_ACTIVE, windowId });

export const WINDOW_MOVE_ACTIVE = `WINDOW_MOVE_ACTIVE`;
export const windowMoveActive = (windowId, { direction } = {}) => ({ type: WINDOW_MOVE_ACTIVE, windowId, direction });

// ---

export const VIEW_OPEN_DESCRIPTOR = `VIEW_OPEN_DESCRIPTOR`;
export const viewOpenDescriptor = { async: (viewId, descriptor) => ({ type: VIEW_OPEN_DESCRIPTOR, viewId, descriptor }) };

// ---

export const PATH_SET_ACTIVE = `PATH_SET_ACTIVE`;
export const pathSetActive = (path) => ({ type: PATH_SET_ACTIVE, path });

// ---

export const REFRESH_THEME_LIST = `REFRESH_THEME_LIST`;
export const refreshThemeList = () => ({ type: REFRESH_THEME_LIST });
