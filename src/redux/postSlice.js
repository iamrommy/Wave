import { createSlice } from "@reduxjs/toolkit";
const postSlice = createSlice({
    name:'post',
    initialState:{
        posts:[],
        selectedPost:null,
        feedPosts: [],
    },
    reducers:{
        //actions
        setPosts:(state,action) => {
            state.posts = action.payload;
        },
        setSelectedPost:(state,action) => {
            state.selectedPost = action.payload;
        },
        setFeedPosts:(state,action) =>{
            state.feedPosts = action.payload;
        }
    }
});
export const {setPosts, setSelectedPost, setFeedPosts} = postSlice.actions;
export default postSlice.reducer;