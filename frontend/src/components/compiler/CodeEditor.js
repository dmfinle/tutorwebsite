import "./codeeditor.css";

import { useState } from "react";
import axios from "axios";

import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Button,
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

export default function CodeEditor() {
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

  //Update url at some point TODO
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

  const [body, setBody] = useState(cppcode);
  const [lang, setLang] = useState(54);
  const [language, setLanguage] = useState("c_cpp");
  const [theme, setTheme] = useState("monokai");
  const [stdin, setStdin] = useState("");
  const [executing, setExecuting] = useState(false);
  const [stdout, setStdout] = useState("");

  const onChangeHandler = (e) => {
    switch (e.target.value) {
      case 54:
        setBody(cppcode);
        setLanguage("c_cpp");
        break;
      case 50:
        setBody(ccode);
        setLanguage("c_cpp");
        break;
      case 62:
        setBody(javacode);
        setLanguage("java");
        break;
      case 71:
        setBody(pythoncode);
        setLanguage("python");
        break;
      default:
        setBody("");
    }
    setLang(e.target.value);
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, 2000));

  const runCode = async (e) => {
    e.preventDefault();
    setExecuting(true);
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
              // loading complete
              setExecuting(false);
              if (result.data.stdout) {
                setStdout(result.data.stdout);
                // outputText.innerHTML += `Results :\n${output}\nExecution Time : ${jsonGetSolution.time} Secs\nMemory used : ${jsonGetSolution.memory} bytes`;
              } else if (result.data.stderr) {
                setStdout(result.data.stderr);
                // outputText.innerHTML += `\n Error :${error}`;
              } else {
                setStdout(result.data.compilation_error);
              }
              // setStdout(result.data.stdout);
            })
            .catch((err) => {
              setExecuting(false);
              console.log("err", err);
            });
        });
      })
      .catch((err) => {
        setExecuting(false);
        console.log("err", err);
      });
  };

  return (
    <div>
      <div id="editor">
        <AceEditor
          mode={language}
          theme={theme}
          onChange={(e) => setBody(e)}
          fontSize={16}
          value={body}
          name="editor"
          placeholder="Begin Typing Source Code Here"
          wrapEnabled={true}
          // enableBasicAutocompletion={true}
          // enableSnippets={true}
          // enableLiveAutocompletion={false}
          height="50%"
          width="40%"
          editorProps={{ $blockScrolling: false }}
        />
      </div>
      <textarea
        id="stdin"
        onChange={(e) => setStdin(e.target.value)}
      ></textarea>
      <Box sx={{ minWidth: 120 }}>
        <FormControl>
          <InputLabel id="language">Language</InputLabel>
          <Select
            id="language"
            value={lang}
            label="Language"
            onChange={onChangeHandler}
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
            id="theme"
            value={theme}
            label="Theme"
            onChange={(e) => setTheme(e.target.value)}
          >
            <MenuItem value={"monokai"}>Monokai</MenuItem>
            <MenuItem value={"clouds"}>Clouds</MenuItem>
            <MenuItem value={"terminal"}>Terminal</MenuItem>
            <MenuItem value={"tomorrow_night_blue"}>
              Tomorrow Night Blue
            </MenuItem>
          </Select>
        </FormControl>
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

      <div className="stdout">{stdout}</div>

      {/* <iframe
        frameBorder="0"
        height="600px"
        src="https://onecompiler.com/embed/"
        width="100%"
      ></iframe> */}
    </div>
  );
}
