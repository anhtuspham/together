import React from 'react'
import { useState, useRef} from "react";
import { Box, IconButton, InputBase, useTheme, Menu, MenuItem} from "@mui/material";
import { Search, Close} from "@mui/icons-material";
import {  useSelector } from "react-redux";
import FlexBetween from "../components/FlexBetween";
import UserListItem from './UserListItem';

const ChatSearchBar = ({helpertext, onClickAction, handleGroup, handleAddUser}) => {

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const token = useSelector((state) => state.token);
  
  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;


  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const spanRef = useRef();
  

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  

  const handleSearch = async (event) => {
    event.preventDefault();
    setAnchorEl(spanRef.current);

    try {
      // Perform the search action with the searchQuery value
      const response = await fetch(
        `http://localhost:3001/users/search?username=${searchQuery}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setSearchResults(data.users);

      // Reset the searchQuery state
      setSearchQuery("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchResults([]);
    setSearchQuery('');
  };



  return (
    <FlexBetween backgroundColor={neutralLight} borderRadius="9px" gap="3rem" padding="0.1rem 1.5rem" ref={spanRef}>
    <Box display="flex" flexDirection="column" gap="1.5rem" >
        <form onSubmit={handleSearch}>
            <InputBase
                name="search"
                id="search"
                placeholder={helpertext}
                value={searchQuery}
                onChange={handleSearchInputChange}

            />

            {searchResults && searchResults.length > 0 && (
                <IconButton onClick={handleClose}>
                  <Close />
                </IconButton>
            )}

            {(!searchResults || searchResults.length === 0) && (
            <IconButton type="submit" onClick={handleSearch}>
                <Search />
            </IconButton>
            )}
            
        </form>
        {/* Display search results in a dropdown */}
        {searchResults && searchResults.length > 0 && (
            <Box display="flex" flexDirection="column" gap="1.5rem">
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
            {searchResults.map((user) => (
                <MenuItem onClick={handleClose}>
                <UserListItem
                  key={user._id}
                  friendId={user._id}
                  name={`${user.firstName} ${user.lastName}`}
                  subtitle={user.occupation}
                  userPicturePath={user.picturePath}
                  onClickAction={onClickAction}
                  userToAdd={user}
                  handleGroup={handleGroup}
                  handleAddUser={handleAddUser}
                />
                </MenuItem>
            ))}
            </Menu>
            </Box>
        )}
    
    </Box>
    </FlexBetween>
  )
}

export default ChatSearchBar;