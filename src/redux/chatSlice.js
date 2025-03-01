import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name:"chat",
    initialState:{
        onlineUsers:[],
        messages:[],
    },
    reducers:{
        // actions
        setOnlineUsers:(state,action) => {
            state.onlineUsers = action.payload;
        },
        setMessages:(state,action) => {
            state.messages = action.payload;
        }
    }
});
export const {setOnlineUsers, setMessages} = chatSlice.actions;
export default chatSlice.reducer;

// import { createSlice } from '@reduxjs/toolkit';

// const chatSlice = createSlice({
//     name: 'chat',
//     initialState: {
//         onlineUsers: [],
//         messages: [],
//         selectedUser: null
//     },
//     reducers: {
//         setMessages: (state, action) => {
//             if (state.selectedUser && state.selectedUser._id === action.payload.receiverId) {
//                 state.messages = [...state.messages, action.payload];
//             }
//         },
//         setSelectedUser: (state, action) => {
//             state.selectedUser = action.payload;
//             state.messages = []; // Reset messages when switching chats
//         }
//     }
// });

// export const { setMessages, setSelectedUser } = chatSlice.actions;
// export default chatSlice.reducer;
