import { WindowEntry } from '@cideditor/cid/reducers/windowRegistry';

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

export const WINDOW_KILL = `WINDOW_KILL`;
export const windowKill = (windowId) => ({ type: WINDOW_KILL, windowId });

export const WINDOW_SPLIT = `WINDOW_SPLIT`;
export const windowSplit = (windowId, { splitType = WindowEntry.WINDOW_TYPE_ROW } = {}) => ({ type: WINDOW_SPLIT, windowId, splitType });

// ---

export const WINDOW_SET_ACTIVE = `WINDOW_SET_ACTIVE`;
export const windowSetActive = (windowId) => ({ type: WINDOW_SET_ACTIVE, windowId });

// ---

export const REFRESH_THEME_LIST = `REFRESH_THEME_LIST`;
export const refreshThemeList = () => ({ type: REFRESH_THEME_LIST });
