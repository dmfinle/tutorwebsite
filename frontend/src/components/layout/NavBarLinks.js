import React from "react";
import { Link } from "react-router-dom";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import PersonIcon from "@material-ui/icons/Person";
import AddIcon from "@material-ui/icons/Add";
import LockIcon from "@material-ui/icons/LockOutlined";
import CameraRollOutlined from "@material-ui/icons/CameraRollOutlined";
import SearchIcon from "@material-ui/icons/Search";
import MessageIcon from "@material-ui/icons/Message";
import InfoIcon from "@material-ui/icons/Info";
import WorkIcon from "@mui/icons-material/WorkOutlined";
import "./layout.css";

const ListItemLink = (props) => {
  return <ListItem button component="a" {...props} />;
};

export const authLinks = (
  <React.Fragment>
    <Link to="/profile" className="link">
      <ListItem button>
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </ListItem>
    </Link>
    <Link to="/tutors" className="link">
      <ListItem button>
        <ListItemIcon>
          <SearchIcon />
        </ListItemIcon>
        <ListItemText primary="Find a Tutor" />
      </ListItem>
    </Link>
    <Link to="/room" className="link">
      <ListItem button>
        <ListItemIcon>
          <CameraRollOutlined />
        </ListItemIcon>
        <ListItemText primary="Create a Room" />
      </ListItem>
    </Link>
    <Link to="/messenger" className="link">
      <ListItem button>
        <ListItemIcon>
          <MessageIcon />
        </ListItemIcon>
        <ListItemText primary="Messages" />
      </ListItem>
    </Link>
    <Link to="/jobs" className="link">
      <ListItem button>
        <ListItemIcon>
          <WorkIcon />
        </ListItemIcon>
        <ListItemText primary="Job Postings" />
      </ListItem>
    </Link>
  </React.Fragment>
);

// export const adminLinks = (
//   <React.Fragment>
//     <ListSubheader inset>Admin Tools</ListSubheader>
//     <Link to="/subjects" className="link">
//       <ListItem button>
//         <ListItemIcon>
//           <SubjectIcon />
//         </ListItemIcon>
//         <ListItemText primary="Manage Subjects" />
//       </ListItem>
//     </Link>
//     <Link to="/manage-users" className="link">
//       <ListItem button>
//         <ListItemIcon>
//           <PeopleIcon />
//         </ListItemIcon>
//         <ListItemText primary="Manage Users" />
//       </ListItem>
//     </Link>
//   </React.Fragment>
// );

export const guestLinks = (
  <React.Fragment>
    <Link to="/login" className="link">
      <ListItem button>
        <ListItemIcon>
          <LockIcon />
        </ListItemIcon>
        <ListItemText primary="Login" />
      </ListItem>
    </Link>
    <Link to="/register" className="link">
      <ListItem button>
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText primary="Register" />
      </ListItem>
    </Link>
  </React.Fragment>
);

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Resources</ListSubheader>

    <ListItemLink href="/about">
      <ListItemIcon>
        <InfoIcon />
      </ListItemIcon>
      <ListItemText primary="About" />
    </ListItemLink>
  </div>
);
