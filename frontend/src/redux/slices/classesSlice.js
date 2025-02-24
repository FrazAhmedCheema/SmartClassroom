import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

const coverImages = [
  'https://gstatic.com/classroom/themes/img_code.jpg',
  'https://gstatic.com/classroom/themes/img_breakfast.jpg',
  'https://gstatic.com/classroom/themes/img_reading.jpg',
  'https://gstatic.com/classroom/themes/img_bookclub.jpg',
  'https://gstatic.com/classroom/themes/img_reachout.jpg'
];

export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (_, { getState, rejectWithValue }) => {
    const { teacherId } = getState().teacher;
    try {
      const response = await fetch('http://localhost:8080/teacher/classes', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched classes:', data);
        
        const classesWithImages = data.classes.map((cls, index) => ({
          ...cls,
          coverImage: coverImages[index % coverImages.length]
        }));
        return classesWithImages;
      } else {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const classesSlice = createSlice({
  name: 'classes',
  initialState: {
    classes: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const selectClassesState = (state) => state.classes || { classes: [], status: 'idle', error: null };

export const selectClasses = createSelector(
  [selectClassesState],
  (classesState) => classesState.classes
);

export const selectClassesStatus = createSelector(
  [selectClassesState],
  (classesState) => classesState.status
);

export const selectClassesError = createSelector(
  [selectClassesState],
  (classesState) => classesState.error
);

export default classesSlice.reducer;
