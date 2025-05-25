import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Type definitions for template state
interface TemplateState {
  state: Record<string, unknown>;
  isLoading?: boolean;
  [key: string]: unknown;
}

const initialState: TemplateState = { 
  state: {},
  isLoading: false
};

export const templateState = createSlice({
  name: "templateState",
  initialState,
  reducers: {
    setDirty: (state, action: PayloadAction<string>) => {
      state[action.payload] = true;
    },
    setFetching: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetState: (state) => {
      // Reset to initial state while preserving structure
      Object.keys(state).forEach(key => {
        if (key !== 'state') {
          delete state[key];
        }
      });
      state.state = {};
      state.isLoading = false;
    },
    updateTemplateData: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.state = { ...state.state, ...action.payload };
    }
  },
});

export const { setDirty, setFetching, resetState, updateTemplateData } = templateState.actions;

export default templateState.reducer;

// Export types for use in other files
export type { TemplateState };