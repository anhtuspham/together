import {useState, useEffect, memo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {deletePost, setPost} from '../../state';
import axios from 'axios';

import {
    ChatBubbleOutlineOutlined,
    FavoriteBorderOutlined,
    FavoriteOutlined,
    ShareOutlined,
    BookmarkBorder,
    BookmarkOutlined, ReportOutlined,
} from '@mui/icons-material';
import {
    Box,
    Divider,
    IconButton,
    Typography,
    useTheme,
    Button,
    TextField,
    FormControlLabel,
    RadioGroup, Modal, FormControl, FormLabel, Radio, Snackbar
} from '@mui/material';
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
    const [selectedReason, setSelectedReason] = useState("");
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const currentUserId = useSelector((state) => state.auth.user._id);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');


    const open = Boolean(anchorEl);
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);
    const loggedInUserId = useSelector((state) => state.auth.user._id);
    const port = import.meta.env.VITE_PORT_BACKEND;

    const isLiked = Boolean(likes[loggedInUserId]);

    const likeCount = Object.keys(likes).length;

    const {palette} = useTheme();
    const main = palette.neutral.main;
    const primary = palette.primary.main;

    const [loadcomments, setLoadComments] = useState(comments || []);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_PORT_BACKEND}/posts/${postId}/comment`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                setLoadComments(data.comments);
            })
            .catch(error => {
                console.error(error);
            });
    }, [postId, token, newComment]);


    const isOwner = loggedInUserId === postUserId;
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    const handleDeletePost = async () => {
        try {
            const response = await axios.delete(`${port}/posts/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dispatch(deletePost({postId}))
            // dispatch(setPost({postId}));
            if(response.status === 201 || response.status === 200){
                setOpenSnackbar(true);
                setSnackbarMessage('Xóa bài viết thành công')
            }
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
            dispatch(setPost({post: response.data}));
            setIsEditMode(false);

            if(response.status === 201 || response.status === 200){
                setOpenSnackbar(true);
                setSnackbarMessage('Cập nhật bài viết thành công')
            }
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
            const response = await fetch(`${port}/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: loggedInUserId,
                    postId: postId,
                    content: newComment,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }
            const data = await response.json();
            setLoadComments((prevComments) => [...prevComments, data.newComment]);
            setNewComment('');
            if(response.status === 201 || response.status === 200){
                setOpenSnackbar(true);
                setSnackbarMessage('Thêm bình luận thành công')
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateComment = async (commentId) => {
        if (!newComment.trim()) {
            return;
        }
        try {
            const response = await fetch(`${port}/posts/${commentId}/edit-comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: newComment,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update comment');
            }
            const updatedData = await response.json();
            setLoadComments((prevComments) =>
                prevComments.map((comment) =>
                    comment._id === commentId ? {...comment, content: newComment} : comment
                )
            );
            setIsEditMode(false);
            setNewComment('');

            if(response.status === 201 || response.status === 200){
                setOpenSnackbar(true);
                setSnackbarMessage('Cập nhật thành công')
            }
        } catch (error) {
            console.error("Failed to update post", error);
        }
    };

    const addComment = () => {
        postComment();
    };

    const handleShare = () => {
        const postUrl = `${port}/posts`;
        navigator.clipboard.writeText(postUrl);
    };

    const handleReportPost = async () => {
        try {
            const response = await fetch(`${port}/posts/${postId}/report`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: currentUserId,
                    reason: selectedReason,
                })
            });
            // dispatch(setPost({ post: response.data }));

            if(response.status === 201 || response.status === 200){
                setOpenSnackbar(true);
                setSnackbarMessage('Báo cáo thành công')
            }
        } catch (error) {
            console.error("Failed to report post", error);
        }
    };

    const ReportModal = memo(({open, onClose, onSubmit}) => {
        return (
            <Modal open={open} onClose={onClose}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        height: "auto",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <FormControl>
                        <FormLabel>Chọn lý do báo cáo:</FormLabel>
                        <RadioGroup
                            value={selectedReason}
                            onChange={(e) => setSelectedReason(e.target.value)}
                        >
                            <FormControlLabel
                                value="Thô tục"
                                control={<Radio/>}
                                label="Thô tục"
                            />
                            <FormControlLabel
                                value="Không phù hợp"
                                control={<Radio/>}
                                label="Không phù hợp"
                            />
                            <FormControlLabel
                                value="Bạo động"
                                control={<Radio/>}
                                label="Bạo động"
                            />
                            <FormControlLabel
                                value="Sai sự thật"
                                control={<Radio/>}
                                label="Sai sự thật"
                            />
                        </RadioGroup>

                    </FormControl>
                    <Box sx={{display: "flex", justifyContent: "flex-end", gap: 1}}>
                        <Button variant="outlined" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                onSubmit(selectedReason);
                                onClose();
                            }}
                            disabled={!selectedReason}
                        >
                            Báo cáo
                        </Button>
                    </Box>
                </Box>
            </Modal>
        );
    });

    return (
        <WidgetWrapper m="2rem 0">
            <FlexBetween>
                <Friend
                    key={postUserId}
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
                            Save
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setIsEditMode(false)}
                        >
                            Cancel
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

                <IconButton onClick={() => setReportModalOpen(true)}>
                    <ReportOutlined/>
                </IconButton>
                <ReportModal
                    open={reportModalOpen}
                    onClose={() => setReportModalOpen(false)}
                    onSubmit={(reason) => {
                        handleReportPost(reason)
                    }}
                />
            </FlexBetween>
            {/* Displaying the comments */}
            {isComments && (
                <Box mt='0.5rem'>
                    <TextField
                        id='my-text-field'
                        label=''
                        name='content'
                        variant='standard'
                        placeholder='Thêm bình luận'
                        size='small'
                        sx={{p: '0.3rem'}}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button variant='contained' size='small' onClick={() => addComment()}>
                        Thêm bình luận
                    </Button>

                    {loadcomments?.map(comment => {
                        if (!comment.userId) {
                            console.error("Comment missing userId:", comment);
                            return null;
                        }

                        const isCommentOwner = comment.userId._id === loggedInUserId;

                        return (
                            <Box key={comment._id} display="flex" alignItems="center" mb="0.5rem">
                                <img
                                    src={`${port}/assets/${comment.userId.picturePath || 'default-avatar.png'}`}
                                    alt="user-avatar"
                                    style={{width: "40px", height: "40px", borderRadius: "50%", marginRight: "1rem"}}
                                />
                                <Box>
                                    <Typography sx={{color: main, fontWeight: "bold"}}>
                                        {comment.userId.firstName || 'Unknown'} {comment.userId.lastName || ''}
                                    </Typography>
                                    {isEditMode === comment._id ? (
                                        <Box display="flex" alignItems="center">
                                            <TextField
                                                required={true}
                                                value={newComment} // Set the new comment value
                                                onChange={(e) => setNewComment(e.target.value)} // Update the value
                                                variant="outlined"
                                                size="small"
                                                sx={{width: '70%'}}
                                            />
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleUpdateComment(comment._id)} // Update comment when clicked
                                                sx={{ml: 1}}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => setIsEditMode(false)} // Exit edit mode
                                                sx={{ml: 1}}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Typography sx={{color: main, m: '0.5rem 0', pl: '1rem'}}>
                                                {comment.content}
                                            </Typography>
                                            {isCommentOwner && (
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    onClick={() => {
                                                        setIsEditMode(comment._id);
                                                        setNewComment(comment.content); // Set the current comment as value
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
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
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
        </WidgetWrapper>
    );
};

export default PostWidget;