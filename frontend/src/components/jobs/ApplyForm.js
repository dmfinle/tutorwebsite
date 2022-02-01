import { FormControl, Input, InputLabel } from "@material-ui/core";
import { Button } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function ApplyForm({ jobs, props }) {
  const [message, setMessage] = useState("");
  const auth = useSelector((state) => state.auth);
  const user = auth.user;

  const submitApplication = () => {
    const createInitialMessage = async () => {
      try {
        const data = {
          receiverId: jobs.owner,
          senderId: user.id,
        };

        const res = await axios.post(`/api/conversations`, data);

        const convoId = res.data._id;

        const body = {
          sender: user.id,
          conversationId: convoId,
          text: message,
        };
        axios.post(`/api/messages`, body);

        const updatedJobs = await axios.patch(`/api/jobs/${jobs._id}`, {
          read: user.id,
        });

        props.history.push("/jobs");
      } catch (err) {
        console.log(err);
      }
    };
    createInitialMessage();
  };
  return (
    <div>
      <FormControl margin="normal" required fullWidth>
        <InputLabel htmlFor="apply">Apply to Job</InputLabel>
        <Input
          type="text"
          value={message}
          multiline
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        />
      </FormControl>
      <Button onClick={submitApplication}>Apply</Button>
    </div>
  );
}
