import { useState, useEffect } from "react";
import Header from "./Header";
import InitialBody from "./InitialBody";
import { FaBullseye } from "react-icons/fa6";
import Dashboard from "./Dashboard";

/**
 * React component to render application.
 * @returns app jsx component
 */
function App() {
  const [isLoginComplete, setIsLoginComplete] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [bodyComponent, setBodyComponent] = useState(null);
  const [uname, setUname] = useState(null);

  /**
   * Function to get the login status of the user
   * @param {*} loginCompleteState boolean state that indicates if a user is logged in
   */
  function getIsLoginComplete(loginCompleteState) {
    setIsLoginComplete(loginCompleteState);
  }

  useEffect(() => {
    console.log("requesting loginState 1");

    chrome.runtime
      .sendMessage({ action: "loginState" })
      .then((res) => {
        setUname(res.uname);
        setIsLoggedIn(res.loginState);
      })
      .catch((err) => {
        console.log(err);
      });
    console.log("request loginState complete 1");
  }, [isLoginComplete]);

  useEffect(() => {
    console.log("requesting loginState 2");

    chrome.runtime
      .sendMessage({ action: "loginState" })
      .then((res) => {
        setUname(res.uname);
        setIsLoggedIn(res.loginState);
      })
      .catch((err) => {
        console.log(err);
      });
    console.log("request loginState complete 2");
  }, []);

  useEffect(() => {
    if (isLoggedIn !== true) {
      setBodyComponent(
        <InitialBody
          sendIsLoginComplete={getIsLoginComplete}
          isLoggedIn={isLoggedIn}
        />
      );
    } else {
      setBodyComponent(<Dashboard username={uname} />);
    }
  }, [isLoggedIn]);

  return (
    <>
      <div>
        <div className="mt-3 mb-5">
          <Header isLoggedIn={isLoggedIn} />
        </div>
        <div className="mt-5">{bodyComponent}</div>
      </div>
    </>
  );
}

export default App;
