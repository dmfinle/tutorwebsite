import React, { Component } from "react";
import { connect } from "react-redux";
import { createProfile } from "../../redux/reducers/profileSlice";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import { FormControl, Input, InputLabel } from "@material-ui/core";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import "./profile.css";
import { findFirstMatch } from "../../utils/lodashOps";

class CreateProfile extends Component {
  state = {
    bio: "",
    type: "",
    availability: "",
    courses: [],
    errors: {},
  };

  addCourse = (e) => {
    this.setState((prevState) => ({
      courses: [
        ...prevState.courses,
        {
          courseName: "",
        },
      ],
    }));
  };

  removeCourse = (id) => {
    let courses = [...this.state.courses];
    const newCourses = courses.filter((course) => {
      return course.id !== id;
    });

    this.setState({
      courses: [...newCourses],
    });

    if (newCourses.length === 0) {
      console.log("No courses");
    }
  };

  onSubmit = (e) => {
    e.preventDefault();
    const { bio, availability, courses, type } = this.state;

    const profileData = {
      data: {
        bio,
        type,
        courses,
        availability,
      },
      history: this.props.history,
    };

    this.props.createProfile(profileData);
  };

  onChange = (e) => {
    const name = e.target.name;
    if (
      name.includes("courseId") ||
      name.includes("courseNumber") ||
      name.includes("courseName")
    ) {
      let courses = [...this.state.courses];
      let i = name.charAt(name.length - 1);
      let property = name.substring(0, name.length - 2);
      courses[i][property] = e.target.value;

      // if we just set the course ID property, also set the subject name
      if (property === "courseId") {
        let subject = findFirstMatch(this.state.subjects, [
          "id",
          e.target.value,
        ]);
        courses[i].courseSubject = subject.name;
      }
      this.setState({ [courses]: courses });
    } else {
      this.setState({ [e.target.name]: e.target.value });
    }
  };

  render() {
    const { bio, availability, courses, type } = this.state;

    const courseItems = courses.map((course, i) => {
      let courseName = "courseName-" + i;

      return (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card className="card" elevation={0}>
            <CardContent>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor={courseName}>Course Name</InputLabel>
                <Input
                  id="courseName"
                  name={courseName}
                  value={course.courseName}
                  onChange={this.onChange}
                />
              </FormControl>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={(e) => this.removeCourse(course.id)}
              >
                Remove Course
              </Button>
            </CardActions>
          </Card>
        </Grid>
      );
    });

    return (
      <div className="padding20">
        <Typography
          variant="h4"
          component="h1"
          align="center"
          className="editHeading"
        >
          Create Tutor Profile
        </Typography>
        <form onSubmit={this.onSubmit}>
          <Grid container spacing={10}>
            <Grid item xs={12} sm={6}>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="type">Tutor or Student?</InputLabel>
                <Select
                  required
                  value={type || ""}
                  onChange={this.onChange}
                  MenuProps={{ style: { maxHeight: 300 } }}
                  inputProps={{
                    name: "type",
                    id: "type",
                  }}
                >
                  <MenuItem value="" />
                  <MenuItem value="Tutor">Tutor</MenuItem>
                  <MenuItem value="Student">Student</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="bio">Short Bio</InputLabel>
                <Input
                  type="text"
                  id="bio"
                  name="bio"
                  value={bio}
                  multiline
                  fullWidth
                  onChange={this.onChange}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="availability">Availablity</InputLabel>
                <Select
                  required
                  MenuProps={{ style: { maxHeight: 300 } }}
                  inputProps={{
                    name: "availability",
                    id: "availability",
                  }}
                  value={availability}
                  multiline
                  fullWidth
                  onChange={this.onChange}
                >
                  <MenuItem value="" />
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Not Available">Not Available</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={10}>
            <Grid item xs={12}>
              <div className="courses" />
            </Grid>
            {courseItems}
            <Grid item xs={12}>
              <Button
                aria-label="Add Course"
                variant="outlined"
                onClick={this.addCourse}
              >
                Add a Course
              </Button>
            </Grid>
          </Grid>
          <Grid container justifyContent="flex-end" spacing={10}>
            <Grid item>
              <Button
                aria-label="Cancel"
                align="right"
                type="cancel"
                className="Button"
                component={Link}
                to="/profile"
              >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                align="right"
                type="submit"
                variant="outlined"
                color="inherit"
                className="button"
                //disabled={!valid}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    );
  }
}

CreateProfile.propTypes = {
  profile: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile,
  errors: state.errors,
  auth: state.auth,
});

export default connect(mapStateToProps, {
  createProfile,
})(withRouter(CreateProfile));
