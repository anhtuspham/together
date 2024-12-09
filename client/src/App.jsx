import {BrowserRouter, Navigate, Routes, Route} from "react-router-dom";

import HomePage from "./scenes/homePage";
import LoginPage from "./scenes/loginPage";
import ProfilePage from "./scenes/profilePage";
import ChatPage from "./scenes/chatPage";
import ActivityPage from "./scenes/activityPage/index.jsx";
import SavedPage from './scenes/savedPage';
import {useEffect, useMemo} from "react";
import {useSelector, useDispatch} from "react-redux";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {createTheme} from "@mui/material/styles";
import {themeSettings} from "./theme";
import {setLogout} from "./state/index.js";
import Admin from "./scenes/admin/index.jsx";
import AdminPage from "./scenes/admin/index.jsx";
import GroupPage from "./scenes/groupPage/index.jsx";
import Notification from "./components/miscellaneous/Notification.jsx"
import io from "socket.io-client";


function App() {

    const dispatch = useDispatch();

    const mode = useSelector((state) => state.auth.mode);
    const token = useSelector((state) => state.auth.token);
    const isAuth = Boolean(token);
    let isAdmin = false;
    const socket = io('http://localhost:3001', {
        query: { token: token }  // Truyền token qua query string
    });
    socket.on('connected', () => {
        console.log('Successfully connected to WebSocket');
    });

    const user = useSelector((state) => state.auth.user);
    if (user) {
        isAdmin = user.role === 'admin';
    }

    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

    useEffect(() => {
        if (token) {
            const tokenExpiration = JSON.parse(atob(token.split(".")[1])).exp * 1000;
            const now = new Date().getTime();

            if (now >= tokenExpiration) {
                dispatch(setLogout());
            }
        }
    }, [token, dispatch]);


    return (
        <div className="app">
            <BrowserRouter>
                <Notification/>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <Routes>
                        <Route path="/" element={<LoginPage/>}/>
                        {/* Only Navigate to Homepage if token exists else stay on login page */}
                        <Route
                            path="/home"
                            element={isAuth ? <HomePage/> : <Navigate to="/"/>}
                        />
                        <Route
                            path="/profile/:userId"
                            element={isAuth ? <ProfilePage/> : <Navigate to="/"/>}
                        />
                        <Route
                            path="/chat"
                            element={isAuth ? <ChatPage/> : <Navigate to="/"/>}
                        />
                        <Route path="/activity" element={isAuth ? <ActivityPage/> : <Navigate to="/"/>}/>
                        <Route path="/group" element={isAuth ? <GroupPage/> : <Navigate to="/"/>}/>
                        <Route
                            path='/saved/:userId'
                            element={isAuth ? <SavedPage/> : <Navigate to='/'/>}
                        />
                        <Route
                            path='/admin'
                            element={isAuth && isAdmin ? <AdminPage/> : <Navigate to='/home'/>}
                        />
                    </Routes>
                </ThemeProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
