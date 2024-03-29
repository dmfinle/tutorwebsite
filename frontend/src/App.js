import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

//Components
import Home from "./components/layout/Home";
import Register from "./components/authorization/Register";
import Login from "./components/authorization/Login";
import PrivateRoute from "./components/common/PrivateRoute";
import NavBar from "./components/layout/NavBar";
import Profile from "./components/user/Profile";
import CreateProfile from "./components/user/CreateProfile";
import Tutor from "./components/searching/Tutor";
import Jobs from "./components/jobs/Jobs";

//Video Room
import CreateRoom from "./components/video-stream/CreateRoom";
import Room from "./components/video-stream/Room";

//Messenger
import Messenger from "./components/messenger/Messenger";

//Css
import "./App.css";

//redux
import store from "./redux/store";
import { setCurrentUser, logoutUser } from "./redux/reducers/authSlice";

//utils
import { checkAuth } from "./utils/authPersist";

// MUI imports
import withStyles from "@material-ui/core/styles/withStyles";
import CssBaseline from "@material-ui/core/CssBaseline";
import CodeEditor from "./components/compiler/CodeEditor";

// Check for JWT for persistence
if (localStorage.jwtToken) {
  const decoded = checkAuth();
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));

  // Check for expired token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // Clear current Profile
    //store.dispatch(clearCurrentProfile());
    // Redirect to login
    window.location.href = "/login";
  }
}

// const styles = (theme) => ({
//   content: {
//     flexGrow: 1,
//     padding: theme.spacing(3),
//     height: "100vh",
//     overflow: "auto",
//   },
//   appBarSpacer: theme.mixins.toolbar,
// });

const App = (/*{ classes }*/) => {
  return (
    <Router>
      {/* <div className="App"> */}
      {/* <CssBaseline /> */}
      <NavBar />
      {/* </div><main className={classes.content}> */}
      {/* <div className={classes.appBarSpacer} /> */}
      <div className="adjust">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <PrivateRoute exact path="/profile" component={Profile} />
          <PrivateRoute exact path="/profile/new" component={CreateProfile} />
          <PrivateRoute path="/room" exact component={CreateRoom} />
          <PrivateRoute path="/room/:roomID" component={Room} />
          <PrivateRoute exact path="/messenger" component={Messenger} />
          <PrivateRoute exact path="/jobs" component={Jobs} />
          <Route exact path="/test" component={CodeEditor} />
        </Switch>
      </div>
      {/* </main> */}
      {/* </div> */}
    </Router>
  );
};

// export default withStyles(styles)(App);
export default App;
