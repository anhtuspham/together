import {BrowserRouter, Navigate, Routes, Route} from "react-router-dom";
//We dont have to make a lot of relative addressing because of jsconfig.json
import HomePage from "./scenes/homePage";
import LoginPage from "./scenes/loginPage";
import ProfilePage from "./scenes/profilePage";
import ChatPage from "./scenes/chatPage";
import SavedPage from './scenes/savedPage';
import {useEffect, useMemo} from "react";
import {useSelector, useDispatch} from "react-redux";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {createTheme} from "@mui/material/styles";
import {themeSettings} from "./theme";
import {setLogout} from "./state/index.js";
import Admin from "./scenes/admin/index.jsx";
import AdminPage from "./scenes/admin/index.jsx";


function App() {

    const dispatch = useDispatch();

    const mode = useSelector((state) => state.mode);
    const token = useSelector((state) => state.token);
    const isAuth = Boolean(token);
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
                        <Route
                            path='/saved/:userId'
                            element={isAuth ? <SavedPage/> : <Navigate to='/'/>}
                        />
                        <Route
                            path='/admin'
                            element={isAuth ? <AdminPage/> : <Navigate to='/'/>}
                        />
                    </Routes>
                </ThemeProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
