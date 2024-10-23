import { useEffect, useRef, useState } from "react";
import { RiLockPasswordLine } from "react-icons/ri";
import { AiOutlinePicture } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import { BiMessageAltError } from "react-icons/bi";
import { SlQuestion } from "react-icons/sl";
import { BsPatchCheck } from "react-icons/bs";
import FaceCam from "./FaceCam";
import TakeImage from "./TakeImage";

function Dashboard({ username }) {
  const dashboardStates = {
    default: 0,
    credentials: 1,
    update: 2,
    delete: 3,
    logout: 4,
    confirmPic: 5,
    updateComplete: 6,
    confirmDelete: 7,
    accDeleted: 8,
    loggedOut: 9,
  };
  const userActions = [
    {
      text: "Manage your credentials",
      icon: <RiLockPasswordLine className="h-14 w-14 font-light" />,
      clickHandler: function () {
        setCurrentState(dashboardStates.credentials);
      },
    },
    {
      text: "Update your pic",
      icon: <AiOutlinePicture className="h-14 w-14 font-light" />,
      clickHandler: function () {
        setCurrentState(dashboardStates.update);
      },
    },
    {
      text: "Delete your account",
      icon: <MdOutlineDelete className="h-14 w-14 font-light" />,
      clickHandler: function () {
        setCurrentState(dashboardStates.confirmDelete);
      },
    },
    {
      text: "Log out",
      icon: <IoLogOutOutline className="h-14 w-14 font-light" />,
      clickHandler: function () {
        chrome.runtime
          .sendMessage({ action: "logout" })
          .then((res) => {
            if (res.loggedOut == true) {
              setCurrentState(dashboardStates.loggedOut);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      },
    },
  ];
  const footElements = {
    default: (
      <>
        <button
          className="w-full bg-black text-white font-bold text-xl h-14 border-2 border-black hover:bg-white hover:text-black rounded rounded-lg"
          onClick={() => {
            window.close();
          }}>
          Close
        </button>
      </>
    ),
    nonDefault: (
      <>
        <button
          className="w-full bg-black text-white font-bold text-xl h-14 border-2 border-black hover:bg-white hover:text-black rounded rounded-lg"
          onClick={() => {
            setCurrentState(dashboardStates.default);
          }}>
          Back
        </button>
      </>
    ),
    update: (
      <>
        <div className="flex flex-row w-full h-fit space-x-3">
          <TakeImage
            registerConfirmStateFunc={sendConfirmPicState}
            forUpdate={true}
          />
          <button
            className="bg-black border border-2 border-black text-lg rounded rounded-lg text-white hover:bg-white hover:text-black font-bold w-full h-14"
            onClick={() => {
              resetToUpdateScreen();
              setCurrentState(dashboardStates.default);
            }}>
            <span>Back</span>
          </button>
        </div>
      </>
    ),
    confirmPic: (
      <>
        <div className="flex flex-row w-full h-fit space-x-3">
          <button
            className="bg-black border border-2 border-black text-lg rounded rounded-lg text-white hover:bg-white hover:text-black font-bold w-full h-14"
            onClick={() => {
              chrome.runtime
                .sendMessage({
                  action: "updatePic",
                  newFaceData: newFaceData,
                })
                .then((res) => {
                  if (res.updated == true) {
                    setCurrentState(dashboardStates.updateComplete);
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            }}>
            <span>Confirm</span>
          </button>
          <button
            className="bg-black border border-2 border-black text-lg rounded rounded-lg text-white hover:bg-white hover:text-black font-bold w-full h-14"
            onClick={() => {
              resetToUpdateScreen();
            }}>
            <span>Back</span>
          </button>
        </div>
      </>
    ),
    confirmDelete: (
      <>
        <div className="flex flex-row w-full h-fit space-x-3">
          <button
            className="bg-black border border-2 border-black text-lg rounded rounded-lg text-white hover:bg-white hover:text-black font-bold w-full h-14"
            onClick={() => {
              chrome.runtime
                .sendMessage({
                  action: "deleteAcc",
                })
                .then((res) => {
                  if (res.deleted == true) {
                    setCurrentState(dashboardStates.accDeleted);
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            }}>
            <span>Yes</span>
          </button>
          <button
            className="bg-black border border-2 border-black text-lg rounded rounded-lg text-white hover:bg-white hover:text-black font-bold w-full h-14"
            onClick={() => {
              setCurrentState(dashboardStates.default);
            }}>
            <span>No</span>
          </button>
        </div>
      </>
    ),
  };
  const headElements = {
    default: <p className="font-bold text-lg w-full"> Welcome {username}! </p>,
    credentials: (
      <>
        <p className="font-bold text-lg w-full">Manage your credentials.</p>
      </>
    ),
    update: <p className="font-bold text-lg w-full">Update your image.</p>,
    confirmPic: (
      <p className="font-bold text-lg w-full">Confirm this as your image?</p>
    ),
    updateComplete: (
      <p className="font-bold text-lg w-full">Account updated.</p>
    ),
    confirmDelete: <p className="font-bold text-lg w-full">Confirm action?</p>,
    accDeleted: <p className="font-bold text-lg w-full">Account deleted.</p>,
    loggedOut: <p className="font-bold text-lg w-full">Logged out.</p>,
  };
  const [uname, setUname] = useState(null);
  const [currentState, setCurrentState] = useState(dashboardStates.default);
  const [bodyComponent, setBodyComponent] = useState(null);
  const [headComponent, setHeadComponent] = useState(null);
  const [footComponent, setFootComponent] = useState(null);
  const [userCreds, setUserCreds] = useState(null);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [confirmPicState, setConfirmPicState] = useState(false);
  const [confirmedPic, setConfirmedPic] = useState(null);
  const [newFaceData, setNewFaceData] = useState(null);
  const imgRef = useRef(null);
  const [dashboardComponents, setDashboardComponents] = useState({
    default: (
      <div className="w-full aspect-square grid grid-cols-2">
        {userActions.map((userAction) => {
          return (
            <>
              <button
                className="border-2 border-black rounded-lg aspect-square m-1 flex flex-col items-center justify-center space-y-3 hover:bg-black hover:text-white hover:underline hover:underline-offset-2"
                onClick={userAction.clickHandler}>
                {userAction.icon}
                <span className="font-semibold">{userAction.text}</span>
              </button>
            </>
          );
        })}
      </div>
    ),
    update: (
      <FaceCam
        inRegisterConfirmState={confirmPicState}
        sendRegisterPic={sendConfirmedPic}
        sendFaceData={sendNewFaceData}
        sendIsLoginComplete={null}
        isLoggedIn={true}
        forUpdate={true}
      />
    ),
    confirmPic: (
      <>
        <img ref={imgRef} className="w-full rounded-lg aspect-square" />
      </>
    ),
    updateComplete: (
      <>
        <div className="w-full aspect-square rounded-lg border-2 border-black flex flex-col justify-center items-center space-y-3">
          <BsPatchCheck className="h-24 w-24" />
          <span className="font-normal text-lg">
            Your image has been updated!
          </span>
        </div>
      </>
    ),
    confirmDelete: (
      <>
        <div className="w-full aspect-square border-2 border-black rounded-lg flex flex-col justify-center items-center space-y-3">
          <SlQuestion className="h-24 w-24" />
          <span className="text-lg font-normal text-center">
            Are you sure you want to proceed?
          </span>
          <span className="text-xs font-medium text-center">
            Your account will be permanently deleted.
          </span>
        </div>
      </>
    ),
    accDeleted: (
      <>
        <div className="w-full aspect-square rounded-lg border-2 border-black flex flex-col justify-center items-center space-y-3">
          <BsPatchCheck className="h-24 w-24" />
          <span className="text-lg font-normal text-center">
            Your account has been successfully deleted.
          </span>
          <span className="text-xs font-medium text-center">
            You can create another account anytime you like.
          </span>
        </div>
      </>
    ),
    loggedOut: (
      <>
        <div className="w-full aspect-square rounded-lg border-2 border-black flex flex-col justify-center items-center space-y-3">
          <BsPatchCheck className="h-24 w-24" />
          <span className="text-lg font-normal text-center">
            You have been logged out.
          </span>
        </div>
      </>
    ),
  });

  function sendConfirmPicState(state) {
    setConfirmPicState(state);
  }

  function sendConfirmedPic(pic) {
    setConfirmedPic(pic);
  }

  function sendNewFaceData(data) {
    setNewFaceData(data);
  }

  function resetToUpdateScreen() {
    setConfirmPicState(false);
    setConfirmedPic(null);
    setNewFaceData(null);
    setDashboardComponents((prev) => ({
      ...prev,
      update: (
        <FaceCam
          inRegisterConfirmState={confirmPicState}
          sendRegisterPic={sendConfirmedPic}
          sendFaceData={sendNewFaceData}
          sendIsLoginComplete={null}
          isLoggedIn={true}
          forUpdate={true}
        />
      ),
    }));
    setCurrentState(dashboardStates.update);
    setRefreshToggle((prev) => !prev);
  }

  useEffect(() => {
    setUname(username);
  }, []);

  useEffect(() => {
    if (uname !== null) {
      chrome.runtime
        .sendMessage({ action: "allCredentials" })
        .then((res) => {
          setUserCreds(res.allCredentials);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [uname]);

  useEffect(() => {
    if (userCreds !== null && userCreds.length > 0) {
      setDashboardComponents((prev) => ({
        ...prev,
        credentials: (
          <div className="w-full aspect-square flex flex-col overflow-y-auto scrollbar-hide space-y-2">
            {userCreds.map((cred) => {
              return (
                <>
                  <div className="w-full flex flex-row border border-black rounded-2xl p-2 space-x-2 items-center">
                    <div
                      className="w-8/12 overflow-hidden hover:overflow-x-auto hover:scrollbar-hide"
                      onWheel={(e) => {
                        e.currentTarget.scrollLeft += e.deltaY;
                      }}>
                      <div className="font-bold text-xs hover:whitespace-normal">
                        {(() => {
                          const url = new URL(cred.url);
                          return url.pathname.length > 1
                            ? url.hostname + url.pathname
                            : url.hostname;
                        })()}
                      </div>
                    </div>
                    <button
                      className="w-2/12 bg-black text-white rounded-md text-xs font-bold p-1 hover:bg-white hover:text-black border border-black"
                      onClick={() => {
                        chrome.runtime
                          .sendMessage({
                            action: "deleteCreds",
                            url: cred.url,
                          })
                          .then((res) => {
                            chrome.tabs.create({
                              url: cred.url,
                            });
                            setUserCreds(res.credentials);
                          })
                          .catch((err) => {
                            console.log(err);
                          });
                      }}>
                      Update
                    </button>
                    <button
                      className="w-2/12 bg-black text-white rounded-md text-xs font-bold p-1 hover:bg-white hover:text-black border border-black"
                      onClick={() => {
                        chrome.runtime
                          .sendMessage({
                            action: "deleteCreds",
                            url: cred.url,
                          })
                          .then((res) => {
                            setUserCreds(res.credentials);
                          })
                          .catch((err) => {
                            console.log(err);
                          });
                      }}>
                      Delete
                    </button>
                  </div>
                </>
              );
            })}
          </div>
        ),
      }));
    } else if (userCreds !== null) {
      setDashboardComponents((prev) => ({
        ...prev,
        credentials: (
          <>
            <div className="w-full border-2 border-black rounded-lg aspect-square flex flex-col font-normal text-lg justify-center items-center space-y-3">
              <BiMessageAltError className="h-24 w-24" />
              You haven't saved any credentials yet!
            </div>
          </>
        ),
      }));
    }
  }, [userCreds]);

  useEffect(() => {
    console.log(currentState);
    switch (currentState) {
      case dashboardStates.default:
        setHeadComponent(headElements.default);
        setBodyComponent(dashboardComponents.default);
        setFootComponent(footElements.default);
        break;
      case dashboardStates.credentials:
        setHeadComponent(headElements.credentials);
        setBodyComponent(dashboardComponents.credentials);
        setFootComponent(footElements.nonDefault);
        break;
      case dashboardStates.update:
        setHeadComponent(headElements.update);
        setBodyComponent(dashboardComponents.update);
        setFootComponent(footElements.update);
        break;
      case dashboardStates.confirmPic:
        setHeadComponent(headElements.confirmPic);
        setBodyComponent(dashboardComponents.confirmPic);
        setFootComponent(footElements.confirmPic);
        break;
      case dashboardStates.updateComplete:
        setHeadComponent(headElements.updateComplete);
        setBodyComponent(dashboardComponents.updateComplete);
        setFootComponent(footElements.nonDefault);
        break;
      case dashboardStates.confirmDelete:
        setHeadComponent(headElements.confirmDelete);
        setBodyComponent(dashboardComponents.confirmDelete);
        setFootComponent(footElements.confirmDelete);
        break;
      case dashboardStates.accDeleted:
        setHeadComponent(headElements.accDeleted);
        setBodyComponent(dashboardComponents.accDeleted);
        setFootComponent(footElements.default);
        break;
      case dashboardStates.loggedOut:
        setHeadComponent(headElements.loggedOut);
        setBodyComponent(dashboardComponents.loggedOut);
        setFootComponent(footElements.default);
    }
  }, [currentState, refreshToggle]);

  useEffect(() => {
    setRefreshToggle((prev) => !prev);
  }, [dashboardComponents]);

  useEffect(() => {
    if (
      confirmedPic !== null &&
      confirmedPic !== undefined &&
      confirmedPic !== -1 &&
      newFaceData !== null &&
      newFaceData !== undefined
    ) {
      setDashboardComponents((prev) => ({
        ...prev,
        confirmPic: (
          <>
            <img
              src={confirmedPic}
              className="w-full rounded-lg aspect-square"
            />
          </>
        ),
      }));
      setCurrentState(dashboardStates.confirmPic);
    } else if (confirmPicState == true) {
      resetToUpdateScreen();
    }
  }, [confirmedPic]);

  useEffect(() => {
    setDashboardComponents((prev) => ({
      ...prev,
      update: (
        <FaceCam
          inRegisterConfirmState={confirmPicState}
          sendRegisterPic={sendConfirmedPic}
          sendFaceData={sendNewFaceData}
          sendIsLoginComplete={null}
          isLoggedIn={true}
          forUpdate={true}
        />
      ),
    }));
  }, [confirmPicState]);

  return (
    <>
      <div className="px-5 pb-1 flex flex-col items-center w-full rounded-lg h-fit space-y-7">
        {headComponent}
        {bodyComponent}
        {footComponent}
      </div>
    </>
  );
}

export default Dashboard;
