import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {searchTile} from "@/request/actions/tile";

export const fetchTiles = createAsyncThunk(
    'tiles/fetchTiles',
    async (params, thunkAPI) => {
        try {
            // 确保 slideId 存在
            const slideId = params?.slideId; // 默认值为 6
            if (!slideId) {
                throw new Error('slideId is required');
            }

            // 调用 searchTile 方法
            const response = await searchTile(
                slideId,
                params?.page || null,
                params?.pageSize || null,
                params?.category || null,
                params?.status || null,
            );

            if (response.err) {
                throw new Error(response.data || 'Failed to fetch tiles');
            }

            return response.data.content;

        } catch (error) {
            return thunkAPI.rejectWithValue(error.message || 'Unknown error');
        }
    }
);


const tiles = createSlice({
    name: 'tiles',
    initialState: {
        tiles: [],
        loading: false,
        error: null,
    },
    reducers: {
        resetSlides(state) {
            state.tiles = [];
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTiles.fulfilled, (state, action) => {
                state.tiles = action.payload;
                state.loading = false;
            })
            .addCase(fetchTiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetTiles } = tiles.actions;

export default tiles.reducer;
