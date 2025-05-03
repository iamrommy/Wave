import { createSlice } from "@reduxjs/toolkit";
const postSlice = createSlice({
    name:'post',
    initialState:{
        posts:[],
        selectedPost:null,
        feedPosts: [],
        loading: false
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
        },
        setLoading: (state,action)=>{
            state.loading = action.payload
        },
        addToFeedPosts: (state, action) => {
            const newPosts = action.payload.filter(
                post => !state.feedPosts.some(existing => existing._id === post._id)
            );
            state.feedPosts = [...state.feedPosts, ...newPosts];
        },                
    }
});
export const {setPosts, setSelectedPost, setFeedPosts, setLoading, addToFeedPosts, addPosts} = postSlice.actions;
export default postSlice.reducer;