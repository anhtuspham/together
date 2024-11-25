import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    mode: "light",
    user: [],
    token: null,
    posts: [],
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setMode: (state) => {
            state.mode = state.mode === "light" ? "dark" : "light";
        },
        setLogin: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        setLogout: (state) => {
            state.user = null;
            state.token = null;
        },
        setFriends: (state, action) => {
            if (state.user) {
                state.user.friends = action.payload.friends;
            } else {
                console.log("User friends non-existent :(");
            }
        },
        setReceivedFriend: (state, action) => {
            if(state.user){
                if(!state.user.receivedFriend){
                    state.user.receivedFriends = [];
                }
                state.user.receivedFriends.push(action.payload.receivedFriends);
            }
        },
        setSentFriends: (state, action) => {
            if (state.user) {
                if(!state.user.sentFriends){
                    state.user.sentFriends = [];
                }
                state.user.sentFriends.push(action.payload.sentFriends);
            }
        },
        removeSentFriend: (state, action) => {
            if (state.user && state.user.sentFriends) {
                // Loại bỏ phần tử khỏi mảng dựa trên `id`
                state.user.sentFriends = state.user.sentFriends.filter(
                    (friend) => friend.senderId !== action.payload.id
                );
            }
        },
        setPosts: (state, action) => {
            state.posts = action.payload.posts
                .reverse()
                .map((element) => {
                    return element;
                });
        },
        setPost: (state, action) => {
            const updatedPosts = state.posts.map((post) => {
                if (post._id === action.payload.post._id) return action.payload.post;
                return post;
            });
            state.posts = updatedPosts;
        },

        deletePost: (state, action) => {
            const filteredPosts = state.posts.filter((post) => post._id !== action.payload.postId);
            return {
                ...state,
                posts: filteredPosts,
            }
        }

    }
})

export const {
    setMode,
    setLogin,
    setLogout,
    setFriends,
    setReceivedFriend,
    setSentFriends,
    removeSentFriend,
    setPost,
    setPosts,
    deletePost
} = authSlice.actions;

export default authSlice.reducer;