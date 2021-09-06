import Component from "react";
import Button from "@material-ui-core/Button";
import React from "react";
import background from "../../images/Coding.jpg";
import Link from "react-dom";

class CodeBackground extends Component {
  state = {
    resizeNotifier: () => {},
  };

  render() {
    var image = background;

    return (
      <div>
        <div id="bg">
          <img src={image} id="image" alt="" />
        </div>
        <div className="centered">
          <div>
            <Button
              aria-label="Cancel"
              fullWidth
              variant="outlined"
              align="center"
              className="Button startButton"
              component={Link}
              to="/login"
            >
              Click Here
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default CodeBackground;
