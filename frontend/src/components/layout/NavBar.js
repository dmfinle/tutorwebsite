import React, { Component } from "react";
import DarkModeToggle from "react-dark-mode-toggle";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import classNames from "classnames";
import { connect } from "react-redux";

import { logoutUser } from "../../redux/reducers/authSlice";
//import { clearCurrentProfile } from "../../redux/actions/profileActions";
import { secondaryListItems, authLinks, guestLinks } from "./NavBarLinks";
import "./layout.css";

// Material UI imports
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import { alpha } from "@material-ui/core/styles/colorManipulator";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import DirectionsRunIcon from "@material-ui/icons/DirectionsRun";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import LogoImg from "../../images/icon.png";

const drawerWidth = 240;

const styles = (theme) => ({
  root: {
    display: "flex",
    width: "100%",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
    backgroundColor: "#494949",
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 12,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    height: "100vh",
    overflow: "auto",
  },
  h5: {
    marginBottom: theme.spacing(2),
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(),
      width: "auto",
    },
  },
  inputRoot: {
    color: "inherit",
    width: "100%",
  },
  grow: {
    flexGrow: 1,
  },
  pb0: {
    paddingBottom: 0,
  },
  pb8: {
    paddingBottom: 8,
  },
});

class AppNavbar extends Component {
  state = {
    open: false,
    isDarkMode: false,
  };

  handleDrawerOpen = (e) => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  onLogoutClick = (e) => {
    e.preventDefault();

    this.props.logoutUser();
  };

  //Move this to redux so app.js can see it
  darkModeToggle = () => {
    this.setState({ isDarkMode: !this.state.isDarkMode });
  };

  render() {
    const { open } = this.state;
    const { classes } = this.props;
    const { isAuthenticated } = this.props.auth;

    return (
      <div>
        <AppBar
          position="fixed"
          color="primary"
          className={classNames(classes.appBar, open && classes.appBarShift)}
        >
          <Toolbar disableGutters={!open} className={classes.toolbar}>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              className={classNames(
                classes.menuButton,
                open && classes.menuButtonHidden
              )}
              onClick={this.handleDrawerOpen}
            >
              <MenuIcon />
            </IconButton>
            <Link to="/" className="link">
              <img
                src={LogoImg}
                className="headerImg"
                alt="logo"
                width="100"
                height="50"
              />
            </Link>

            <div className={classes.grow} />
            <span align="right">
              <DarkModeToggle
                onChange={this.darkModeToggle}
                checked={this.state.isDarkMode}
                size={50}
              />
            </span>
          </Toolbar>
        </AppBar>
        <Drawer
          anchor="left"
          classes={{
            paper: classNames(
              classes.drawerPaper,
              !open && classes.drawerPaperClose
            ),
          }}
          open={open}
          onClose={this.handleDrawerClose}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={this.handleDrawerClose}
            onKeyDown={this.handleDrawerClose}
          >
            <div className={classes.toolbarIcon}>
              <IconButton onClick={this.handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            {isAuthenticated ? (
              <List className={classes.pb0}>{authLinks}</List>
            ) : (
              <List className={classes.pb0}>{guestLinks}</List>
            )}
            {isAuthenticated && (
              <ListItem button onClick={this.onLogoutClick}>
                <ListItemIcon>
                  <DirectionsRunIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            )}
            <Divider />
            <List>{secondaryListItems}</List>
          </div>
        </Drawer>
      </div>
    );
  }
}

AppNavbar.propTypes = {
  classes: PropTypes.object.isRequired,
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logoutUser })(
  withStyles(styles)(AppNavbar)
);
