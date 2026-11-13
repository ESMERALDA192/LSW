import { createAsyncThunk } from '@reduxjs/toolkit';
import { getInstitutesAll, saveInstitute, deleteInstitute } from './actions/institutesActions.js';
export const GET_DATA_START = createAsyncThunk('institutes/load', getInstitutesAll);
export const SAVE_INSTITUTE = createAsyncThunk('institutes/save', saveInstitute);
export const DELETE_INSTITUTE = createAsyncThunk('institutes/delete', async id => { await deleteInstitute(id); return id; });
