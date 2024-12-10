import React, { useState } from 'react';
import Navbar from "../../scenes/navBar";
import { Box, Grid } from '@mui/material';
import { useSelector } from "react-redux";
import useMediaQuery from '@mui/material/useMediaQuery';
import ChatList from '../../components/ChatList';
import ChatDetail from '../../components/ChatDetail';

const ChatPage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const user = useSelector((state) => state.auth.user);
  const fullName = `${user.firstName} ${user.lastName}`;
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              height: '100%',
              padding: isNonMobileScreens ? '16px 32px' : '8px 16px',
              gap: '16px',
              overflow: 'hidden',
            }}
        >
          {/* Chat List */}
          <Box
              sx={{
                flex: 1,
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                overflowY: 'auto',
                boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
              }}
          >
            <ChatList fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          </Box>

          {/* Chat Detail */}
          <Box
              sx={{
                flex: 2,
                backgroundColor: '#fff',
                borderRadius: '8px',
                overflowY: 'auto',
                boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
              }}
          >
            <ChatDetail fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          </Box>
        </Box>
      </Box>
  );
};

export default ChatPage;
