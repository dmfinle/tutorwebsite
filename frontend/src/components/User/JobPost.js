// import "./jobs.css";
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
import Grid from "@material-ui/core/Grid";
import axios from "axios";
export default function JobPost() {
  const auth = useSelector((state) => state.auth);
  const user = auth.user;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // const onChangeHandler = useCallback(({ target: { name, value } }) =>
  //   setTitle((state) => ({ ...state, [name]: value }), [])
  // );
  // const onChangeHandler2 = useCallback(({ target: { name, value } }) =>
  //   setDescription((state) => ({ ...state, [name]: value }), [])
  // );

  const onSubmit = (e) => {
    e.preventDefault();

    const submitJob = async () => {
      const job = {
        title: title,
        text: description,
        owner: user.id,
        read: [user.id],
      };

      const response = await axios.post(`/api/jobs`, job);
      setTitle("");
      setDescription("");
      alert("Job request posted");
    };

    submitJob();
  };
  return (
    <div>
      <form onSubmit={onSubmit}>
        <FormControl margin="normal" required>
          <InputLabel>Title</InputLabel>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Title"
          />
        </FormControl>
        {/* <Grid item xs={20} sm={6}> */}
        <FormControl margin="normal" required>
          <InputLabel>Description</InputLabel>
          <Input
            type="text"
            value={description}
            multiline
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter job description"
          />
        </FormControl>
        {/* </Grid> */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          className="purpleSubmit"
        >
          Post
        </Button>
      </form>
    </div>
  );
}
