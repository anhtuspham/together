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
            if( state.user){
                state.user.receivedFriends = action.payload.receivedFriends;
            }
        },
        setSentFriends: (state, action) => {
            if( state.user){
                state.user.sentFriends = action.payload.sentFriends;
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

export const {setMode, setLogin, setLogout, setFriends, setReceivedFriend, setSentFriends, setPost, setPosts, deletePost} = authSlice.actions;

export default authSlice.reducer;