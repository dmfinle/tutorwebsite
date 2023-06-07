import "./codeeditor.css";

import { useEffect, useState, useRef } from "react";
import axios from "axios";

import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Button,
  TextField,
} from "@mui/material";

//Ace imports
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
// import "ace-builds/src-noconflict/ext-static_highlight";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-terminal";
import "ace-builds/src-noconflict/theme-tomorrow_night_blue";
import "ace-builds/src-noconflict/theme-clouds";
import { io } from "socket.io-client";

export default function CodeEditor({ props }) {
  // const langChoice = [
  //   { id: 45, name: "Assembly (NASM 2.14.02)" },
  //   { id: 46, name: "Bash (5.0.0)" },
  //   { id: 47, name: "Basic (FBC 1.07.1)" },
  //   { id: 75, name: "C (Clang 7.0.1)" },
  //   { id: 76, name: "C++ (Clang 7.0.1)" },
  //   { id: 48, name: "C (GCC 7.4.0)" },
  //   { id: 52, name: "C++ (GCC 7.4.0)" },
  //   { id: 49, name: "C (GCC 8.3.0)" },
  //   { id: 53, name: "C++ (GCC 8.3.0)" },
  //   { id: 50, name: "C (GCC 9.2.0)" },
  //   { id: 54, name: "C++ (GCC 9.2.0)" },
  //   { id: 86, name: "Clojure (1.10.1)" },
  //   { id: 51, name: "C# (Mono 6.6.0.161)" },
  //   { id: 77, name: "COBOL (GnuCOBOL 2.2)" },
  //   { id: 55, name: "Common Lisp (SBCL 2.0.0)" },
  //   { id: 56, name: "D (DMD 2.089.1)" },
  //   { id: 57, name: "Elixir (1.9.4)" },
  //   { id: 58, name: "Erlang (OTP 22.2)" },
  //   { id: 44, name: "Executable" },
  //   { id: 87, name: "F# (.NET Core SDK 3.1.202)" },
  //   { id: 59, name: "Fortran (GFortran 9.2.0)" },
  //   { id: 60, name: "Go (1.13.5)" },
  //   { id: 88, name: "Groovy (3.0.3)" },
  //   { id: 61, name: "Haskell (GHC 8.8.1)" },
  //   { id: 62, name: "Java (OpenJDK 13.0.1)" },
  //   { id: 63, name: "JavaScript (Node.js 12.14.0)" },
  //   { id: 78, name: "Kotlin (1.3.70)" },
  //   { id: 64, name: "Lua (5.3.5)" },
  //   { id: 89, name: "Multi-file program" },
  //   { id: 79, name: "Objective-C (Clang 7.0.1)" },
  //   { id: 65, name: "OCaml (4.09.0)" },
  //   { id: 66, name: "Octave (5.1.0)" },
  //   { id: 67, name: "Pascal (FPC 3.0.4)" },
  //   { id: 85, name: "Perl (5.28.1)" },
  //   { id: 68, name: "PHP (7.4.1)" },
  //   { id: 43, name: "Plain Text" },
  //   { id: 69, name: "Prolog (GNU Prolog 1.4.5)" },
  //   { id: 70, name: "Python (2.7.17)" },
  //   { id: 71, name: "Python (3.8.1)" },
  //   { id: 80, name: "R (4.0.0)" },
  //   { id: 72, name: "Ruby (2.7.0)" },
  //   { id: 73, name: "Rust (1.40.0)" },
  //   { id: 81, name: "Scala (2.13.2)" },
  //   { id: 82, name: "SQL (SQLite 3.27.2)" },
  //   { id: 83, name: "Swift (5.2.3)" },
  //   { id: 74, name: "TypeScript (3.7.4)" },
  //   { id: 84, name: "Visual Basic.Net (vbnc 0.0.0.5943)" },
  // ];

  //Update url at some point TODO. URL for judge compiler
  const baseURL = "http://0.0.0.0:2358";

  const cppcode = `#include <iostream>
using namespace std;
  int main() {
      cout<<"Welcome to EngiNearU" << endl; \n
}`;
  const javacode = `public class Main{
  public static void main(String args[]){
    System.out.println("Welcome to EngiNearU");
  }
}
`;
  const ccode = `#include <stdio.h>
  int main() {
      printf("Welcome to EngiNearU\\n"); \n
}`;
  const pythoncode = `def execute(): \n\t print "Welcome to EngiNearU" \nexecute()`;

  const roomID = props.match.params.roomID;

  const socketRef = useRef();
  const [body, setBody] = useState(cppcode);
  const [lang, setLang] = useState(54);
  const [language, setLanguage] = useState("c_cpp");
  const [theme, setTheme] = useState("monokai");
  const [stdin, setStdin] = useState("");
  const [executing, setExecuting] = useState(false);
  const [focus, setFocus] = useState(false);
  const [stdout, setStdout] = useState(
    "Remove this later\nHuge\nTest\nOverflow\nadcnnnmmmmmmmm"
  );

  const langOnChange = (e) => {
    let language;
    console.log("send language");
    switch (e.target.value) {
      case 54:
      case 50:
        language = "c_cpp";
        break;
      case 62:
        language = "java";
        break;
      case 71:
        language = "python";
        break;
      default:
    }
    setLanguage(language);
    setLang(e.target.value);
    const info = {
      body,
      lang: e.target.value,
      language: language,
      theme,
      stdin,
      executing,
      focus,
      stdout,
    };
    socketRef.current.emit("sendMessage", {
      info,
    });
  };

  useEffect(() => {
    socketRef.current = io.connect("/editor");
    socketRef.current.emit("addUser", roomID);
    socketRef.current.on("allUsers", (data) => {
      console.log("receiving message");
      console.log(data.stdout);
      if (data?.body !== undefined) setBody(data.body);
      if (data?.lang !== undefined) setLang(data.lang);
      if (data?.language !== undefined) setLanguage(data.language);
      if (data?.theme !== undefined) setTheme(data.theme);
      if (data?.stdin !== undefined) setStdin(data.stdin);
      if (data?.executing !== undefined) setExecuting(data.executing);
      if (data?.focus !== undefined) setFocus(data.focus);
      if (data?.stdout !== undefined) setStdout(data.stdout);
    });
  }, []);

  const bodyOnChange = (e) => {
    setBody(e);
    console.log("send body");
    const info = {
      body: e,
      lang,
      language,
      theme,
      stdin,
      executing,
      focus,
      stdout,
    };
    socketRef.current.emit("sendMessage", {
      info,
    });
  };

  const themeOnChange = (e) => {
    setTheme(e.target.value);
    console.log("send theme");
    const info = {
      body,
      lang,
      language,
      theme: e.target.value,
      stdin,
      executing,
      focus,
      stdout,
    };
    socketRef.current.emit("sendMessage", {
      info,
    });
  };

  const stdinOnChange = (e) => {
    setStdin(e.target.value);
    console.log("send stdin");
    const info = {
      body,
      lang,
      language,
      theme,
      stdin: e.target.value,
      executing,
      focus,
      stdout,
    };
    socketRef.current.emit("sendMessage", {
      info,
    });
  };

  const focusOnChange = (e) => {
    setFocus(!focus);
    console.log("send focus");
    const info = {
      body,
      lang,
      language,
      theme,
      stdin,
      executing,
      focus: !focus,
      stdout,
    };
    socketRef.current.emit("sendMessage", {
      info,
    });
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, 2000));

  const runCode = async (e) => {
    e.preventDefault();
    setExecuting(true);
    console.log("send execute");
    let info = {
      body,
      lang,
      language,
      theme,
      stdin,
      executing: true,
      focus,
      stdout,
    };
    socketRef.current.emit("sendMessage", {
      info,
    });
    // setStdout("Running Code");
    let data = {
      source_code: body,
      language_id: lang,
      number_of_runs: null,
      stdin: stdin,
      expected_output: null,
      cpu_time_limit: null,
      cpu_extra_time: null,
      wall_time_limit: null,
      memory_limit: null,
      stack_limit: null,
      max_processes_and_or_threads: null,
      enable_per_process_and_thread_time_limit: null,
      enable_per_process_and_thread_memory_limit: null,
      max_file_size: null,
      enable_network: null,
    };
    axios
      .post(`${baseURL}/submissions`, data)
      .then((result) => {
        // we should get the token here
        console.log("result", result);
        const token = result.data.token;
        console.log("token " + token);
        // wait for 3 second
        sleep().then(() => {
          // get the repose from submimisson api
          axios
            .get(`${baseURL}/submissions/${token}`)
            .then((result) => {
              console.log("result");
              console.log(result);
              let ioresult;
              if (result.data.stdout) {
                ioresult = result.data.stdout;
                // outputText.innerHTML += `Results :\n${output}\nExecution Time : ${jsonGetSolution.time} Secs\nMemory used : ${jsonGetSolution.memory} bytes`;
              } else if (result.data.stderr) {
                ioresult = result.data.stderr;
              } else {
                ioresult = result.data.compile_output;
              }
              setStdout(ioresult);
              // loading complete
              setExecuting(false);
              info = {
                body,
                lang,
                language,
                theme,
                stdin,
                executing: false,
                focus,
                stdout: ioresult,
              };
              console.log(ioresult);
              socketRef.current.emit("sendMessage", {
                info,
              });
            })
            .catch((err) => {
              setExecuting(false);
              info = {
                body,
                lang,
                language,
                theme,
                stdin,
                executing: false,
                focus,
                stdout,
              };
              socketRef.current.emit("sendMessage", {
                info,
              });
              console.log("err", err);
            });
        });
      })
      .catch((err) => {
        setExecuting(false);
        info = {
          body,
          lang,
          language,
          theme,
          stdin,
          executing: false,
          focus,
          stdout,
        };
        socketRef.current.emit("sendMessage", {
          info,
        });
        console.log("err", err);
      });
  };

  return (
    <div className="main">
      <div id="editor">
        <AceEditor
          mode={language}
          theme={theme}
          onChange={bodyOnChange}
          fontSize={16}
          value={body}
          name="editor"
          placeholder="Begin Typing Source Code Here"
          wrapEnabled={true}
          // enableBasicAutocompletion={true}
          // enableSnippets={true}
          // enableLiveAutocompletion={false}
          height="100%"
          width="50%"
          editorProps={{ $blockScrolling: false }}
        />
      </div>

      <Box sx={{ minWidth: 120, display: "flex", justifyContent: "flex-end" }}>
        <FormControl>
          <InputLabel id="language">Language</InputLabel>
          <Select
            sx={{ backgroundColor: "white" }}
            id="language"
            value={lang}
            label="Language"
            onChange={langOnChange}
          >
            <MenuItem value={54}>C++</MenuItem>
            <MenuItem value={50}>C</MenuItem>
            <MenuItem value={62}>Java</MenuItem>
            <MenuItem value={71}>Python 3</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="theme">Editor Theme</InputLabel>
          <Select
            sx={{ backgroundColor: "white" }}
            id="theme"
            value={theme}
            label="Theme"
            onChange={themeOnChange}
          >
            <MenuItem value={"monokai"}>Monokai</MenuItem>
            <MenuItem value={"clouds"}>Clouds</MenuItem>
            <MenuItem value={"terminal"}>Terminal</MenuItem>
            <MenuItem value={"tomorrow_night_blue"}>
              Tomorrow Night Blue
            </MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={focusOnChange}>
          {focus ? "Hide Stdin" : "Show Stdin"}
        </Button>
        {!executing ? (
          <Button variant="contained" onClick={runCode}>
            Execute
          </Button>
        ) : (
          <Button variant="contained" disabled>
            Loading...
          </Button>
        )}
      </Box>

      <div className="stdout">
        {stdout}

        <p className={focus ? "toggle-visible" : "toggle-hidden"}>
          <TextField
            sx={{
              backgroundColor: "white",
              width: "500px",
              overflow: "true",
            }}
            // id="stdin"
            multiline
            placeholder="Input stdin into program 1 item per line"
            maxRows={1}
            size="medium"
            value={stdin}
            onChange={stdinOnChange}
          />
        </p>
      </div>
    </div>
  );
}
