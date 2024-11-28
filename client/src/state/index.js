import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    mode: "light",
    user: {
        sentFriends: [],

    },
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
            if (state.user) {
                if (!state.user.receivedFriends) {
                    state.user.receivedFriends = [];
                }

                state.user.receivedFriends = [
                    ...state.user.receivedFriends,
                    ...action.payload.receivedFriends,
                ];
            }
        },
        setSentFriends: (state, action) => {
            if (state.user) {
                // Đảm bảo `sentFriends` là một mảng
                if (!Array.isArray(state.user.sentFriends)) {
                    state.user.sentFriends = [];
                    console.log(`state.user.sentfriend: ${state.user.sentFriends}`)
                }
                console.log(`state.user.sentFriends123123123 ${state.user.sentFriends}`,);

                const newFriends = Array.isArray(action.payload.sentFriends)
                    ? action.payload.sentFriends
                    : [action.payload.sentFriends];

                console.log(`currentStateSentFriends:`, action.payload.sentFriends, state.user.sentFriends);

                // Lọc bỏ bạn bè trùng lặp
                const uniqueFriends = newFriends.filter(
                    (friend) =>
                        !state.user.sentFriends.some(
                            (existingFriend) => existingFriend._id === friend._id
                        )
                );

                // Thêm bạn bè mới nếu có
                if (uniqueFriends.length > 0) {
                    state.user.sentFriends = [...state.user.sentFriends, ...uniqueFriends];
                }
            }
        },
        removeSentFriend: (state, action) => {
            if (state.user && state.user.sentFriends) {
                state.user.sentFriends = state.user.sentFriends.filter(
                    (friend) => friend.senderId !== action.payload.id
                );
            }
        },

        removeReceivedFriend: (state, action) => {
            if (state.user && state.user.receivedFriends) {
                state.user.receivedFriends = state.user.receivedFriends.filter(
                    (friend) => friend.receiverId !== action.payload.id
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
    removeReceivedFriend,
    setPost,
    setPosts,
    deletePost
} = authSlice.actions;

export default authSlice.reducer;