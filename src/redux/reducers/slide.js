import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchSlide } from 'src/request/actions/slide';

// 异步请求：获取 slides
export const fetchSlides = createAsyncThunk(
    'slides/fetchSlides',
    async (params, thunkAPI) => {
        try {
            const response = await searchSlide(
                params?.imageGroupId || null,
                params?.imageId || null,
                params?.imageName || null,
                params?.imageUrl || null,
                params?.imageTypeId || null,
                params?.page || null,
                params?.size || null
            );
            if (response.err) {
                throw new Error(response.data || 'Failed to fetch slides');
            }
            console.log(response.data.content); // 打印 API 返回值
            return response.data.content;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message || 'Unknown error');
        }
    }
);

// 创建 Redux slice
const slides = createSlice({
    name: 'slides',
    initialState: {
        slides: [], // 存储 slides 数据
        loading: false, // 加载状态
        error: null, // 错误状态
        selectedSlide: null, // 用于存储 handleClick 的参数
    },
    reducers: {
        resetSlides(state) {
            state.slides = [];
            state.error = null;
            state.loading = false;
        },
        clearError(state) {
            state.error = null;
        },
        setSelectedSlide(state, action) {
            // 存储项目参数（projectId, imageName, status）
            state.selectedSlide = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSlides.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSlides.fulfilled, (state, action) => {
                state.slides = action.payload;
                state.loading = false;
            })
            .addCase(fetchSlides.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// 导出 reducers 和 actions
export const { resetSlides, clearError, setSelectedSlide } = slides.actions;

export default slides.reducer;
