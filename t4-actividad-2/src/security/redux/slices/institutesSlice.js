import { createSlice } from '@reduxjs/toolkit';
import { GET_DATA_START, SAVE_INSTITUTE, DELETE_INSTITUTE } from '../thunks.js';
const slice = createSlice({ name: 'INSTITUTES', initialState: { institutesDataArr: [], loading: false, error: '' },
  reducers: { SET_DATA_INSTITUTES: (state, action) => { state.institutesDataArr = action.payload; } },
  extraReducers: b => b
    .addCase(GET_DATA_START.pending, s => { s.loading = true; s.error = ''; })
    .addCase(GET_DATA_START.fulfilled, (s, a) => { s.loading = false; s.institutesDataArr = a.payload; })
    .addCase(GET_DATA_START.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })
    .addCase(SAVE_INSTITUTE.fulfilled, (s, a) => { const i = s.institutesDataArr.findIndex(r => r.id === a.payload.id); if (i === -1) s.institutesDataArr.push(a.payload); else s.institutesDataArr[i] = a.payload; })
    .addCase(DELETE_INSTITUTE.fulfilled, (s, a) => { s.institutesDataArr = s.institutesDataArr.filter(r => r.id !== a.payload); })
});
export const { SET_DATA_INSTITUTES } = slice.actions;
export default slice.reducer;
