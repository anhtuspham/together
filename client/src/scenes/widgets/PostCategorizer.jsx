// PostCategorizer.js

import { Box, Button, FormControl, InputLabel, MenuItem, Select, Snackbar } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {showNotification} from "../../state/notificationSlice.js";

const PostCategorizer = ({
  postId,
  likes,
  picturePath,
  userId,
  userPicturePath,
  name,
  description,
  location,
  comments,
}) => {
  const [category, setCategory] = useState('');
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  // const {_id} = useSelector((state) => state.auth.user);
  // const userId = _id;

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleSave = async () => {
    try {
      // Save the post to the database with the selected category
      const response = await axios.post(
        `${import.meta.env.VITE_PORT_BACKEND}/saved`,
        {
          userId,
          postId,
          category,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if(response.ok){
        dispatch(
            showNotification({
              message: "Đã lưu!",
              type: "success",
            })
        );
      } else {
        dispatch(
            showNotification({
              message: "Có lỗi khi lưu!",
              type: "error",
            })
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'justifyCenter' }}>
      <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
        <InputLabel>Category</InputLabel>
        <Select value={category} label='Category' onChange={handleCategoryChange}>
          <MenuItem value='personal'>Personal</MenuItem>
          <MenuItem value='funny'>Funny</MenuItem>
          <MenuItem value='motivational'>Motivational</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ mt: 1.1 }}>
        <Button variant='contained' onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default PostCategorizer;
