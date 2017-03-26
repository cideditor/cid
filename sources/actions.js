import { WindowEntry } from '@cideditor/cid/reducers/windowRegistry';

export const WINDOW_MOVE_ACTIVE_LEFT = `WINDOW_MOVE_ACTIVE_LEFT`;
export const WINDOW_MOVE_ACTIVE_RIGHT = `WINDOW_MOVE_ACTIVE_RIGHT`;
export const WINDOW_MOVE_ACTIVE_UP = `WINDOW_MOVE_ACTIVE_UP`;
export const WINDOW_MOVE_ACTIVE_DOWN = `WINDOW_MOVE_ACTIVE_DOWN`;

// ---

export const WINDOW_SET = `WINDOW_SET`;
export const windowSet = (window) => ({ type: WINDOW_SET, window });

export const WINDOW_UNSET = `WINDOW_UNSET`;
export const windowUnset = (windowId) => ({ type: WINDOW_UNSET, windowId });

export const VIEW_SET = `VIEW_SET`;
export const viewSet = (view) => ({ type: VIEW_SET, view });

export const VIEW_UNSET = `VIEW_UNSET`;
export const viewUnset = (viewId) => ({ type: VIEW_UNSET, viewId });

export const BUFFER_SET = `BUFFER_SET`;
export const bufferSet = (buffer) => ({ type: BUFFER_SET, buffer });

export const BUFFER_UNSET = `BUFFER_UNSET`;
export const bufferUnset = (bufferId) => ({ type: BUFFER_UNSET, bufferId });

// ---

export const POPUP_OPEN = `POPUP_OPEN`;
export const popupOpen = (component) => ({ type: POPUP_OPEN, component });

export const POPUP_CLOSE = `POPUP_CLOSE`;
export const popupClose = () => ({ type: POPUP_CLOSE, component });

// ---

export const WINDOW_KILL = `WINDOW_KILL`;
export const windowKill = (windowId) => ({ type: WINDOW_KILL, windowId });

export const WINDOW_SPLIT = `WINDOW_SPLIT`;
export const windowSplit = (windowId, { splitType = WindowEntry.WINDOW_TYPE_ROW } = {}) => ({ type: WINDOW_SPLIT, windowId, splitType });

// ---

export const WINDOW_SET_ACTIVE = `WINDOW_SET_ACTIVE`;
export const windowSetActive = (windowId) => ({ type: WINDOW_SET_ACTIVE, windowId });

export const WINDOW_MOVE_ACTIVE = `WINDOW_MOVE_ACTIVE`;
export const windowMoveActive = (windowId, { direction } = {}) => ({ type: WINDOW_MOVE_ACTIVE, windowId, direction });

// ---

export const REFRESH_THEME_LIST = `REFRESH_THEME_LIST`;
export const refreshThemeList = () => ({ type: REFRESH_THEME_LIST });
