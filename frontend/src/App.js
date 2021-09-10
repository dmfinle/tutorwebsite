import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

//Components
import Home from "./components/layout/Home";
import Register from "./components/authorization/Register";

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

const styles = (theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    height: "100vh",
    overflow: "auto",
  },
  appBarSpacer: theme.mixins.toolbar,
});

const App = ({ classes }) => {
  return (
    <Router>
      <div className="App">
        <CssBaseline />
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/register" component={Register} />
          </Switch>
        </main>
      </div>
    </Router>
  );
};

export default withStyles(styles)(App);
