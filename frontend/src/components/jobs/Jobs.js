import "./jobs.css";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { FormControl, Input, InputLabel } from "@material-ui/core";
import axios from "axios";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function Jobs(props) {
  const [expanded, setExpanded] = useState({});
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState({});
  const onChangeHandler = useCallback(({ target: { name, value } }) =>
    setMessage((state) => ({ ...state, [name]: value }), [])
  );

  const auth = useSelector((state) => state.auth);
  const user = auth.user;

  useEffect(() => {
    const getJobs = async () => {
      try {
        const res = await axios.get(`/api/jobs/${user.id}`);
        console.log(res.data);
        setJobs(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    getJobs();
  }, []);

  const handleExpandClick = (id) => {
    setExpanded((prevState) => ({
      ...prevState,
      [id]: !prevState[id] || false,
    }));
  };

  const submitApplication = (id, owner) => {
    const createInitialMessage = async () => {
      try {
        const data = {
          receiverId: owner,
          senderId: user.id,
        };

        const res = await axios.post(`/api/conversations`, data);

        console.log(res.data);

        const convoId = res.data._id;

        const body = {
          sender: user.id,
          conversationId: convoId,
          text: message[id],
        };
        axios.post(`/api/messages`, body);

        const res2 = await axios.patch(`/api/jobs/${id}`, {
          read: user.id,
        });

        const updatedJob = res2.data;
        //console.log(updatedJobs.data);
        const filteredJobs = jobs.filter((job) => job._id !== updatedJob._id);
        console.log(filteredJobs);
        setJobs(filteredJobs);
      } catch (err) {
        console.log(err);
      }
    };
    createInitialMessage();
  };

  return (
    <div>
      {jobs.map((job) => (
        <div>
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                {job.title}
              </Typography>
              <Typography variant="body2">{job.text}</Typography>
            </CardContent>
            <CardActions>
              <ExpandMore
                expand={expanded[job._id]}
                onClick={() => handleExpandClick(job._id)}
                aria-expanded={expanded}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandMore>
            </CardActions>
            <Collapse in={expanded[job._id]} timeout="auto" unmountOnExit>
              <CardContent>
                <Typography>
                  <FormControl margin="normal" required fullWidth>
                    <InputLabel htmlFor="apply">Apply to Job</InputLabel>
                    <Input
                      type="text"
                      key={job._id}
                      name={job._id}
                      value={message[job._id]}
                      multiline
                      onChange={onChangeHandler}
                    />
                  </FormControl>
                  <Button
                    onClick={() => {
                      submitApplication(job._id, job.owner);
                    }}
                  >
                    Apply
                  </Button>
                </Typography>
              </CardContent>
            </Collapse>
          </Card>
          <br></br>
        </div>
      ))}
    </div>
  );
}
