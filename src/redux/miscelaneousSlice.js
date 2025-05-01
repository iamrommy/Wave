import {createSlice} from "@reduxjs/toolkit"

const miscelaneousSlice = createSlice({
    name:"miscelaneous",
    initialState:{
        activeTab : "posts",
        openPost : null,
    },
    reducers:{
        // actions
        setActiveTab:(state,action) => {
            state.activeTab = action.payload;
        },
        setOpenPost:(state,action) => {
            state.openPost = action.payload;
        }
    }
});
export const {
    setActiveTab,
    setOpenPost
} = miscelaneousSlice.actions;
export default miscelaneousSlice.reducer;