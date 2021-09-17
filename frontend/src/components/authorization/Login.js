import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../../redux/reducers/authSlice";
import { Link } from "react-router-dom";
import { Redirect } from "react-router";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import LockIcon from "@material-ui/icons/LockOutlined";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme) => ({
  main: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    [theme.breakpoints.up(400 + theme.spacing(3 * 2))]: {
      width: 400,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(
      3
    )}px`,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(),
  },
});

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      drawerOpen: false,
    };
  }

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/profile");
    }
  }

  onSubmit = (e) => {
    e.preventDefault();

    const { email, password } = this.state;
    const userData = {
      email: email,
      password: password,
    };
    this.props.loginUser(userData);
  };

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    const { errors, classes, auth } = this.props;

    return (
      <div className={classes.main}>
        <Paper className={classes.paper} elevation={3}>
          <Avatar className="blueAvatar">
            <LockIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign In
          </Typography>
          <form className={classes.form} onSubmit={this.onSubmit}>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="email">Email</InputLabel>
              <Input
                id="email"
                name="email"
                autoComplete="email"
                autoFocus
                onChange={this.onChange}
              />
            </FormControl>
            <span className="error">{errors.email}</span>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="password">Password</InputLabel>
              <Input
                name="password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={this.onChange}
              />
            </FormControl>
            <span className="error">{errors.password}</span>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="purpleSubmit"
            >
              Sign In
            </Button>
          </form>
        </Paper>
        <div className="link-container">
          <Link to="/register" className="link reg-link">
            Are you a new user? Click here to register!
          </Link>
        </div>
        {auth.isAuthenticated ? <Redirect to="/profile" /> : <React.Fragment />}
      </div>
    );
  }
}

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
});

export default connect(mapStateToProps, { loginUser })(
  withStyles(styles)(Login)
);
