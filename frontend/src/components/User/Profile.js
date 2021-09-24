import React, { Component } from "react";
import PropTypes from "prop-types";

// components

import ProfileAbout from "./ProfileAbout";

// Redux imports
import { getCurrentProfile } from "../../redux/reducers/profileSlice";
import { connect } from "react-redux";
import "./profile.css";

class Profile extends Component {
  componentDidMount() {
    //if (this.props.match.params.profile) {
    this.props.getCurrentProfile(this.props.auth.user.id);
    // }
  }

  //   componentWillReceiveProps(nextProps) {
  //     if (nextProps.profile.profile === null && this.props.profile.loading) {
  //       this.props.history.push("/not-found");
  //     }
  //   }

  render() {
    const { profile, loading } = this.props.profile;
    let profileContent;

    profileContent =
      profile === null || loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <div>
          <ProfileAbout profile={profile} />
        </div>
      );

    return <div>{profileContent}</div>;
  }
}

Profile.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile,
  auth: state.auth,
});

export default connect(mapStateToProps, { getCurrentProfile })(Profile);
