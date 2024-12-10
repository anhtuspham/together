import React, { useState, useRef } from "react";
import { Box, IconButton, InputBase, useTheme, Menu, MenuItem } from "@mui/material";
import { Search, Close } from "@mui/icons-material";
import { useSelector } from "react-redux";
import FlexBetween from "../components/FlexBetween";
import Friend from "../components/Friend";
import GroupListItem from "./GroupListIttem.jsx";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const token = useSelector((state) => state.auth.token);

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
      const response = await fetch(
          `${import.meta.env.VITE_PORT_BACKEND}/group/search?username=${searchQuery}&groupname=${searchQuery}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
      );
      const data = await response.json();
      setUserResults(data.users || []);
      setGroupResults(data.groups || []);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setUserResults([]);
    setGroupResults([]);
    setSearchQuery("");
  };

  return (
      <FlexBetween
          backgroundColor={neutralLight}
          borderRadius="9px"
          gap="3rem"
          padding="0.1rem 1.5rem"
          ref={spanRef}
      >
        <Box display="flex" flexDirection="column" gap="1.5rem">
          <form onSubmit={handleSearch}>
            <InputBase
                name="search"
                id="search"
                placeholder="Search for users or groups..."
                value={searchQuery}
                onChange={handleSearchInputChange}
            />
            {userResults.length > 0 || groupResults.length > 0 ? (
                <IconButton onClick={handleClose}>
                  <Close />
                </IconButton>
            ) : (
                <IconButton type="submit" onClick={handleSearch}>
                  <Search />
                </IconButton>
            )}
          </form>

          {((userResults.length > 0 || groupResults.length > 0) && (
              <Box display="flex" flexDirection="column" gap="1.5rem">
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "basic-button",
                    }}
                >
                  {/* Hiển thị người dùng */}
                  {userResults.map((user) => (
                      <MenuItem onClick={handleClose} key={user._id}>
                        <Friend
                            friendId={user._id}
                            name={`${user.firstName} ${user.lastName}`}
                            subtitle={user.occupation}
                            userPicturePath={user.picturePath}
                        />
                      </MenuItem>
                  ))}

                  {/* Hiển thị nhóm */}
                  {groupResults.map((group) => (
                      <MenuItem onClick={handleClose} key={group._id}>
                        <GroupListItem
                            groupId={group._id}
                            name={group.name}
                            description={group.description}
                            picturePath={group.picturePath}
                        />
                      </MenuItem>
                  ))}
                </Menu>
              </Box>
          ))}
        </Box>
      </FlexBetween>
  );
};

export default SearchBar;
