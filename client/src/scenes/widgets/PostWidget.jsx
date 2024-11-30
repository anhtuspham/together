import {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {deletePost, setPost} from '../../state';
import axios from 'axios';

import {
    ChatBubbleOutlineOutlined,
    FavoriteBorderOutlined,
    FavoriteOutlined,
    ShareOutlined,
    BookmarkBorder,
    BookmarkOutlined,
} from '@mui/icons-material';
import {Box, Divider, IconButton, Typography, useTheme, Button, TextField} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {Menu, MenuItem} from '@mui/material';

import FlexBetween from "../../components/FlexBetween";
import Friend from '../../components/Friend';
import WidgetWrapper from '../../components/WidgetWrapper';
import PostCategorizer from './PostCategorizer';


const PostWidget = ({
                        postId,
                        postUserId,
                        name,
                        description,
                        location,
                        picturePath,
                        userPicturePath,
                        likes,
                        comments,
                    }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [editedDescription, setEditedDescription] = useState(description);
    const [isComments, setIsComments] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [PostCategory, setPostCategory] = useState(false);

    const open = Boolean(anchorEl);
    const dispatch = useDispatch();
    const token = useSelector((state) => state.token);
    const loggedInUserId = useSelector((state) => state.user._id);
    const port = import.meta.env.VITE_PORT_BACKEND;
    //As likes is a map, we will check if the current logged in user is
    // present in the post likes map

    const isLiked = Boolean(likes[loggedInUserId]);
    // Calculates no. of likes based on no. of keys
    const likeCount = Object.keys(likes).length;

    const {palette} = useTheme();
    const main = palette.neutral.main;
    const primary = palette.primary.main;

    const [loadcomments, setLoadComments] = useState([]);

    useEffect(() => {
      axios.get(`http://localhost:3001/posts/${postId}/get/comment`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          setLoadComments(response.data.comments);
          console.log('50', loadcomments);
        })
        .catch(error => {
          console.error(error);
        });
    }, [postId, token, newComment, loadcomments]);

    const isOwner = loggedInUserId === postUserId;
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleDeletePost = async () => {
        try {
            await axios.delete(`${port}/posts/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dispatch(deletePost({postId}))
            // dispatch(setPost({postId})); // Cập nhật Redux Store
        } catch (error) {
            console.error("Failed to delete post", error);
        }
    };

    const handleUpdatePost = async () => {
        try {
            const response = await axios.patch(
                `${port}/posts/${postId}`,
                {description: editedDescription},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            dispatch(setPost({post: response.data})); // Cập nhật Redux Store
            setIsEditMode(false);
        } catch (error) {
            console.error("Failed to update post", error);
        }
    };

    const patchLike = async () => {
        const response = await fetch(`${port}/posts/${postId}/like`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({userId: loggedInUserId}),
        });
        const updatedPost = await response.json();
        dispatch(setPost({post: updatedPost}));
    };


    const postComment = async () => {
        try {
            const response = await axios.post(
                `${port}/posts/${postId}/comment`,
                {
                    userId: loggedInUserId,
                    postId: postId,
                    comment: newComment,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
        } catch (error) {
            console.error(error);
        }
    };

    const addComment = () => {
        postComment();
    };

    const handleShare = () => {
        const postUrl = `${port}/posts`;
        navigator.clipboard.writeText(postUrl);
    };

    return (
        <WidgetWrapper m="2rem 0">
            <FlexBetween>
                <Friend
                    friendId={postUserId}
                    name={name}
                    subtitle={location}
                    userPicturePath={userPicturePath}
                />
                {isOwner && (
                    <>
                        <IconButton onClick={handleMenuOpen}>
                            <MoreVertIcon/>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleMenuClose}
                            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                            transformOrigin={{vertical: 'top', horizontal: 'right'}}
                        >
                            <MenuItem
                                onClick={() => {
                                    setIsEditMode(true);
                                    handleMenuClose();
                                }}
                            >
                                Sửa
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleDeletePost();
                                    handleMenuClose();
                                }}
                            >
                                Xóa
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </FlexBetween>

            {isEditMode ? (
                <Box mt="1rem">
                    <TextField
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        fullWidth
                        variant="outlined"
                    />
                    <FlexBetween mt="0.5rem">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdatePost}
                        >
                            Lưu
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setIsEditMode(false)}
                        >
                            Hủy
                        </Button>
                    </FlexBetween>
                </Box>
            ) : (
                <Typography color={main} sx={{mt: "1rem"}}>
                    {description}
                </Typography>
            )}

            {picturePath && (
                <img
                    width="100%"
                    height="auto"
                    alt="post"
                    style={{borderRadius: "0.75rem", marginTop: "0.75rem"}}
                    src={`${port}/assets/${picturePath}`}
                />
            )}

            <FlexBetween mt="0.25rem">
                <FlexBetween gap="1rem">
                    <FlexBetween gap="0.3rem">
                        <IconButton onClick={patchLike}>
                            {isLiked ? (
                                <FavoriteOutlined sx={{color: primary}}/>
                            ) : (
                                <FavoriteBorderOutlined/>
                            )}
                        </IconButton>
                        <Typography>{likeCount}</Typography>
                    </FlexBetween>

                    <FlexBetween gap="0.3rem">
                        <IconButton onClick={() => setIsComments(!isComments)}>
                            <ChatBubbleOutlineOutlined/>
                        </IconButton>
                        <Typography>{loadcomments?.length}</Typography>
                    </FlexBetween>

                    {!window.location.pathname.includes('saved') &&
                        <IconButton onClick={() => setPostCategory(!PostCategory)}>
                            {PostCategory ? (
                                <BookmarkBorder sx={{color: primary}}/>
                            ) : (
                                <BookmarkBorder/>
                            )}
                        </IconButton>
                    }
                </FlexBetween>

                <IconButton onClick={handleShare}>
                    <ShareOutlined/>
                </IconButton>
            </FlexBetween>
            {/* Displaying the comments */}
            {isComments && (
                <Box mt='0.5rem'>
                    <TextField
                        id='my-text-field'
                        label=''
                        name='comment'
                        variant='standard'
                        placeholder='Add your Comment'
                        size='small'
                        sx={{p: '0.3rem'}}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button variant='contained' size='small' onClick={() => addComment()}>
                        Add
                    </Button>

                    {loadcomments?.map(comment => (
                        <Box key={comment._id}>
                            <Typography sx={{color: main, m: '0.5rem 0', pl: '1rem'}}>
                                {comment?.comment}</Typography>
                        </Box>
                    )).reverse()}
                    {comments.length > 1 && <Divider/>}
                </Box>
            )}

            <Box mt='0.5rem'>
                {PostCategory &&
                    <PostCategorizer postId={postId} likes={likes} picturePath={picturePath}
                                     userId={loggedInUserId}
                                     userPicturePath={userPicturePath}
                                     name={name}
                                     description={description}
                                     location={location}
                                     comments={comments}
                    />}
            </Box>
        </WidgetWrapper>
    );
};

export default PostWidget;