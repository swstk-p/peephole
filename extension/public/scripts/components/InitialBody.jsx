import { useState, useEffect, createElement } from "react";
import FaceCam from "./FaceCam";
import CameraInstructions from "./CameraInstructions";
import TakeImage from "./TakeImage";
import Instruction from "./Instruction";
import RegisterConfirmPage from "./RegisterConfirmPage";
import Notice from "./Notice";

/**
 * React component to display the extension's main body.
 * @returns extension main body jsx
 */
function InitialBody({ sendIsLoginComplete, isLoggedIn }) {
  const initialDivClass =
    "px-5 pb-1 flex flex-col items-center justify-start w-full rounded-lg";
  const [permitState, setPermitState] = useState("");
  const [divClass, setDivClass] = useState(initialDivClass);
  const [component, setComponent] = useState(null);
  const [inRegisterPicConfirmState, setInRegisterPicConfirmState] =
    useState(false);
  const [registerPic, setRegisterPic] = useState(null);
  const [registerFaceData, setRegisterFaceData] = useState(null);
  const [registerConfirmed, setRegisterConfirmed] = useState(null);
  const [oldUser, setOldUser] = useState(null);
  const reminder =
    "Reminder: Please ensure that your face is detected for login or sign up.";

  const oldUserReminder = "It seems that you have already registered.";
  const registeredConfirmedNotice = "You can now log in.";
  const loggedInNotice = "You are now logged in.";

  /**
   * Function to set whether the confirm state for registering pic is occurring
   * @param {*} state boolean value which indicates whether the confirm state is occurring
   */
  function defineInRegisterPicConfirmState(state) {
    setInRegisterPicConfirmState(state);
  }

  /**
   * Function to set image data from FaceCam component
   * @param {*} pic image data which is to be rendered on screen
   */
  function getRegisterPic(pic) {
    setRegisterPic(pic);
  }

  /**
   * Function to set face data after detection in FaceCam component
   * @param {*} faceData data obtained after detecting face
   */
  function getRegisterFaceData(faceData) {
    setRegisterFaceData(faceData);
  }

  /**
   * Function to get user confirmation about sign up
   * @param {*} confirmation user confirmation about sign up
   */
  function getRegisterConfirmation(confirmation) {
    setRegisterConfirmed(confirmation);
  }

  /**
   * Function to determine if the user is old or not from child components
   * @param {*} correct Boolean state representing if the user is old or not
   */
  function isOldUser(correct) {
    setOldUser(correct);
  }

  useEffect(() => {
    /**
     * Obtains the state for extension's camera permission and sets it to component permission state.
     * @async
     * @returns undefined
     */
    async function getCamPermissionState() {
      // get the permission state of camera and set it to a component state
      try {
        const { state } = await navigator.permissions.query({ name: "camera" });
        setPermitState(state);
      } catch (err) {
        console.log(err);
      }
    }
    getCamPermissionState();
  }, []);

  useEffect(() => {
    // if permitState is set and granted, show face cam else show camera instructions
    if (permitState !== "" && permitState === "granted") {
      setComponent(
        <>
          <FaceCam
            inRegisterConfirmState={inRegisterPicConfirmState}
            sendRegisterPic={getRegisterPic}
            sendFaceData={getRegisterFaceData}
            sendIsLoginComplete={sendIsLoginComplete}
            isLoggedIn={isLoggedIn}
          />
          <TakeImage
            registerConfirmStateFunc={defineInRegisterPicConfirmState}
          />
          <div className="text-xs text-center w-full h-fit rounded-md">
            <span className="text-center font-semibold">{reminder}</span>
          </div>
        </>
      );
      setDivClass(divClass + " h-fit space-y-7");
    } else if (permitState !== "granted") {
      console.log("HERE");

      setComponent(<CameraInstructions />);
      setDivClass(divClass + " h-fit");
    }
  }, [permitState]);

  useEffect(() => {
    if (oldUser == true) {
      setComponent(
        <>
          <FaceCam
            inRegisterConfirmState={inRegisterPicConfirmState}
            sendRegisterPic={getRegisterPic}
            sendFaceData={getRegisterFaceData}
            sendIsLoginComplete={sendIsLoginComplete}
            isLoggedIn={isLoggedIn}
          />
          <TakeImage
            registerConfirmStateFunc={defineInRegisterPicConfirmState}
          />
          <Notice text={oldUserReminder} />
        </>
      );
    } else if (registerConfirmed == true) {
      setComponent(
        <>
          <FaceCam
            inRegisterConfirmState={inRegisterPicConfirmState}
            sendRegisterPic={getRegisterPic}
            sendFaceData={getRegisterFaceData}
            sendIsLoginComplete={sendIsLoginComplete}
            isLoggedIn={isLoggedIn}
          />
          <TakeImage
            registerConfirmStateFunc={defineInRegisterPicConfirmState}
          />
          <Notice text={registeredConfirmedNotice} />
        </>
      );
    } else {
      setComponent(
        <>
          <FaceCam
            inRegisterConfirmState={inRegisterPicConfirmState}
            sendRegisterPic={getRegisterPic}
            sendFaceData={getRegisterFaceData}
            sendIsLoginComplete={sendIsLoginComplete}
            isLoggedIn={isLoggedIn}
          />
          <TakeImage
            registerConfirmStateFunc={defineInRegisterPicConfirmState}
          />
          <Notice text={reminder} />
        </>
      );
    }
  }, [inRegisterPicConfirmState]);

  useEffect(() => {
    if (
      registerPic !== null &&
      registerPic !== -1 &&
      registerFaceData !== null
    ) {
      setComponent(
        <>
          <RegisterConfirmPage
            imgDataURL={registerPic}
            faceData={registerFaceData}
            sendRegisterConfirmation={getRegisterConfirmation}
            isOldUser={isOldUser}
          />
        </>
      );
    } else if (registerPic == -1) {
      setInRegisterPicConfirmState(false);
      setRegisterPic(null);
    }
  }, [registerPic]);

  useEffect(() => {
    if (registerConfirmed == null) {
      setComponent(
        <>
          <FaceCam
            inRegisterConfirmState={inRegisterPicConfirmState}
            sendRegisterPic={getRegisterPic}
            sendFaceData={getRegisterFaceData}
            sendIsLoginComplete={sendIsLoginComplete}
            isLoggedIn={isLoggedIn}
          />
          <TakeImage
            registerConfirmStateFunc={defineInRegisterPicConfirmState}
          />
          <Notice text={reminder} />
        </>
      );
    }
    if (registerConfirmed !== null && registerConfirmed == false) {
      setInRegisterPicConfirmState(false);
      setRegisterConfirmed(null);
      setComponent(
        <>
          <FaceCam
            inRegisterConfirmState={inRegisterPicConfirmState}
            sendRegisterPic={getRegisterPic}
            sendFaceData={getRegisterFaceData}
            sendIsLoginComplete={sendIsLoginComplete}
            isLoggedIn={isLoggedIn}
          />
          <TakeImage
            registerConfirmStateFunc={defineInRegisterPicConfirmState}
          />
          <Notice text={reminder} />
        </>
      );
    } else if (registerConfirmed) {
      setComponent(
        <>
          <FaceCam
            inRegisterConfirmState={inRegisterPicConfirmState}
            sendRegisterPic={getRegisterPic}
            sendFaceData={getRegisterFaceData}
            sendIsLoginComplete={sendIsLoginComplete}
            isLoggedIn={isLoggedIn}
          />
          <TakeImage
            registerConfirmStateFunc={defineInRegisterPicConfirmState}
          />
          <Notice text={registeredConfirmedNotice} />
        </>
      );
    }
  }, [registerConfirmed]);

  useEffect(() => {
    if (oldUser) {
      setComponent(
        <>
          <FaceCam
            inRegisterConfirmState={inRegisterPicConfirmState}
            sendRegisterPic={getRegisterPic}
            sendFaceData={getRegisterFaceData}
            sendIsLoginComplete={sendIsLoginComplete}
            isLoggedIn={isLoggedIn}
          />
          <TakeImage
            registerConfirmStateFunc={defineInRegisterPicConfirmState}
          />
          <Notice text={oldUserReminder} />
        </>
      );
    }
  }, [oldUser]);

  useEffect(() => {
    console.log("isLoggedIn changed in main body to:", isLoggedIn);
    if (permitState === "granted") {
      if (isLoggedIn == true) {
        setComponent(
          <>
            <FaceCam
              inRegisterConfirmState={inRegisterPicConfirmState}
              sendRegisterPic={getRegisterPic}
              sendFaceData={getRegisterFaceData}
              sendIsLoginComplete={sendIsLoginComplete}
              isLoggedIn={isLoggedIn}
            />
            <TakeImage
              registerConfirmStateFunc={defineInRegisterPicConfirmState}
            />
            <Notice text={loggedInNotice} />
          </>
        );
      } else if (isLoggedIn !== true && oldUser == true) {
        setComponent(
          <>
            <FaceCam
              inRegisterConfirmState={inRegisterPicConfirmState}
              sendRegisterPic={getRegisterPic}
              sendFaceData={getRegisterFaceData}
              sendIsLoginComplete={sendIsLoginComplete}
              isLoggedIn={isLoggedIn}
            />
            <TakeImage
              registerConfirmStateFunc={defineInRegisterPicConfirmState}
            />
            <Notice text={oldUserReminder} />
          </>
        );
      } else if (isLoggedIn !== true && registerConfirmed == true) {
        setComponent(
          <>
            <FaceCam
              inRegisterConfirmState={inRegisterPicConfirmState}
              sendRegisterPic={getRegisterPic}
              sendFaceData={getRegisterFaceData}
              sendIsLoginComplete={sendIsLoginComplete}
              isLoggedIn={isLoggedIn}
            />
            <TakeImage
              registerConfirmStateFunc={defineInRegisterPicConfirmState}
            />
            <Notice text={registeredConfirmedNotice} />
          </>
        );
      } else {
        setComponent(
          <>
            <FaceCam
              inRegisterConfirmState={inRegisterPicConfirmState}
              sendRegisterPic={getRegisterPic}
              sendFaceData={getRegisterFaceData}
              sendIsLoginComplete={sendIsLoginComplete}
              isLoggedIn={isLoggedIn}
            />
            <TakeImage
              registerConfirmStateFunc={defineInRegisterPicConfirmState}
            />
            <Notice text={reminder} />
          </>
        );
      }
    }
  }, [isLoggedIn]);

  return (
    <>
      <div className={divClass}> {component} </div>{" "}
    </>
  );
}

export default InitialBody;
