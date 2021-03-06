import React, { useState } from "react";
import { useDispatch } from "react-redux";
import GoogleLogin from "react-google-login";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import {
  passwordCheck,
  emailCheck,
  usernameCheck,
  checkAll,
} from "../utilities/availCheck";
import { firstLogIn } from "../actions/index";
import axios from "axios";

const StyledSignUpPage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  row-gap: 20px;
  min-height: 100vh;

  h1 {
    border-bottom: 2px solid black;
    width: 400px;
    margin: 0;
  }

  #sign-in-link {
    font-size: 0.8rem;

    span {
      padding: 0.5rem;
      display: inline-block;
      transition: 0.2s linear;

      &:hover {
        color: #f58820;
        cursor: pointer;
        transform: translateY(-3px);
      }
    }
  }

  #username-input-wrapper {
    display: flex;
    max-width: 400px;
    column-gap: 10px;
    border-bottom: 1px solid black;

    input {
      flex: 2;
      border-bottom: none;
    }

    button {
      flex: 1;
      height: 1.3rem;
      background: #dddddd;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    row-gap: 10px;

    input {
      border: none;
      border-bottom: 1px solid black;
      width: 400px;
      font-size: 1.3rem;

      &:focus {
        outline: none;
      }

      &::placeholder {
        opacity: 0.7;
        font-size: 0.7rem;
      }
    }

    p {
      color: #fa8900;
      max-width: 300px;
      margin: 0;
      font-size: 0.8rem;
    }

    button {
      border: none;
      width: 400px;
      height: 40px;
      background: #f5d0a9;
      border-radius: 3px;

      &:hover {
        cursor: pointer;
        background: #f58820;
        transition: 0.2s linear;
      }
    }
  }
`;

const StyledGoogleLogin = styled(GoogleLogin)`
  width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SignUpPage = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [userInput, setUserInput] = useState({
    email: "",
    username: "",
    password: "",
    passwordCheck: "",
  });

  const [errMessage, setErrMessage] = useState({
    emailErr: "",
    usernameErr: "",
    passwordErr: "",
    passwordCheckErr: "",
    other: "",
  });

  const handleUserInput = (key) => (e) => {
    setUserInput({ ...userInput, [key]: e.target.value });
  };

  const handleUsernameExist = (e) => {
    e.preventDefault();

    const { username } = userInput;

    axios
      .post(`${process.env.REACT_APP_SERVER_DOMAIN}/signup/username-exist`, {
        username: username,
      })
      .then(() => {
        setErrMessage({
          ...errMessage,
          usernameErr: "?????? ????????? ???????????? ?????????",
        });
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 409) {
            setErrMessage({
              ...errMessage,
              usernameErr: "???????????? ??????????????? ????????????",
            });
          }
          console.log(err.response);
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log("Error :", err.message);
        }
        console.log(err.config);
      });
  };

  const handleGoogleSignUp = (res) => {
    axios
      .post(
        `${process.env.REACT_APP_SERVER_DOMAIN}/oauth/google/signup`,
        {
          tokenId: res.tokenId,
          subId: res.googleId,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        const { userId, username, accessToken, subId } = res.data;

        dispatch(firstLogIn(userId, username, accessToken, subId));

        history.push("/");
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 409) {
            setErrMessage({
              ...errMessage,
              other: "?????? ????????? ??????????????? ???????????? ????????? ?????????",
            });
            console.log(err.response);
          } else if (err.request) {
            console.log(err.request);
          } else {
            console.log("Error :", err.message);
          }
          console.log(err.config);
        }
      });
  };

  const handleGoogleSignUpErr = (err) => {
    console.log(err);
  };

  const handleSignUp = (e) => {
    e.preventDefault();

    const { email, username, password } = userInput;

    if (!email || !username || !password) {
      setErrMessage({
        ...errMessage,
        other: "?????? ????????? ???????????????",
      });
      return;
    }

    if (!checkAll(username, email, password)) {
      setErrMessage({
        ...errMessage,
        other: "?????? ????????? ???????????? ????????? ?????????",
      });
      return;
    }

    setErrMessage({
      ...errMessage,
      other: "",
    });

    axios
      .post(
        `${process.env.REACT_APP_SERVER_DOMAIN}/signup`,
        {
          email: email,
          username: username,
          password: password,
        },
        {
          withCredentials: true,
        }
      )
      .then(() => {
        axios
          .post(
            `${process.env.REACT_APP_SERVER_DOMAIN}/user`,
            {
              email: email,
              password: password,
            },
            {
              withCredentials: true,
            }
          )
          .then((res) => {
            const { userId, username, accessToken } = res.data;

            dispatch(firstLogIn(userId, username, accessToken));

            history.push("/");
          })
          .catch((err) => {
            if (err.response) {
              console.log(err.response);
            } else if (err.request) {
              console.log(err.request);
            } else {
              console.log("Error :", err.message);
            }
            console.log(err.config);
          });
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 409) {
            if (err.response.data.message === "email exist") {
              setErrMessage({
                ...errMessage,
                other: "?????? ????????? ???????????????",
              });
            } else {
              setErrMessage({
                ...errMessage,
                other: "???????????? ??????????????? ????????????",
              });
            }
            console.log(err.response);
          } else if (err.request) {
            console.log(err.request);
          } else {
            console.log("Error :", err.message);
          }
          console.log(err.config);
        }
      });
  };

  const handleErrMessage = (message) => {
    switch (message) {
      case "1":
        setErrMessage({
          ...errMessage,
          passwordErr: "??????????????? 8?????? ??????????????? ?????????",
        });
        break;
      case "2":
        setErrMessage({
          ...errMessage,
          passwordErr: "??????????????? ??????,??????,??????????????? ???????????? ?????????",
        });
        break;
      case "3":
        setErrMessage({
          ...errMessage,
          usernameErr: "??????????????? 2?????? ??????????????? ?????????",
        });
        break;
      case "4":
        setErrMessage({
          ...errMessage,
          usernameErr:
            "??????????????? ??????,??????,????????? ???????????? ????????? ????????? ?????????",
        });
        break;
      case "5":
        setErrMessage({
          ...errMessage,
          emailErr: "????????? ???????????? ????????? ?????????",
        });
        break;
      case "emailAvail":
        setErrMessage({
          ...errMessage,
          emailErr: "",
        });
        break;
      case "usernameAvail":
        setErrMessage({
          ...errMessage,
          usernameErr: "",
        });
        break;
      case "passwordAvail":
        setErrMessage({
          ...errMessage,
          passwordErr: "",
        });
        break;
      default:
        return "";
    }
  };

  return (
    <StyledSignUpPage>
      <h1>Sign Up</h1>
      <form>
        <label>Email</label>
        <input
          type="text"
          onChange={handleUserInput("email")}
          onKeyUp={() => handleErrMessage(emailCheck(userInput.email))}
        ></input>
        {errMessage.emailErr && <p>{errMessage.emailErr}</p>}
        <label>Username</label>
        <div id="username-input-wrapper">
          <input
            type="text"
            onChange={handleUserInput("username")}
            onKeyUp={() => handleErrMessage(usernameCheck(userInput.username))}
            placeholder="???????????? 2??? ???????????? ????????? ???????????? ?????????"
          ></input>
          <button onClick={handleUsernameExist}>????????????</button>
        </div>
        {errMessage.usernameErr && <p>{errMessage.usernameErr}</p>}
        <label>Password</label>
        <input
          type="password"
          onChange={handleUserInput("password")}
          onKeyUp={() => handleErrMessage(passwordCheck(userInput.password))}
          placeholder="??????????????? 8?????? ???????????? ??????,??????,??????????????? ??????????????? ?????????"
        ></input>
        {errMessage.passwordErr && <p>{errMessage.passwordErr}</p>}
        <label>Password Check</label>
        <input
          type="password"
          onChange={handleUserInput("passwordCheck")}
        ></input>
        {userInput.password &&
          userInput.passwordCheck &&
          userInput.password !== userInput.passwordCheck && (
            <p>????????? ??????????????? ????????????</p>
          )}
        <button onClick={handleSignUp}>Submit</button>
        {errMessage.other && <p>{errMessage.other}</p>}
      </form>
      <StyledGoogleLogin
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
        buttonText="Sign up with Google"
        onSuccess={handleGoogleSignUp}
        onFailure={handleGoogleSignUpErr}
        cookiePolicy={"single_host_origin"}
      />
      <p id="sign-in-link">
        ?????? ?????? ?????????????
        <span onClick={() => history.push("/login")}>????????? ?????? ??????</span>
      </p>
    </StyledSignUpPage>
  );
};

export default SignUpPage;
