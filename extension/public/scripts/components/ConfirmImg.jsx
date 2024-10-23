import { useEffect, useRef, useState } from "react";
import { FaArrowUpFromBracket } from "react-icons/fa6";
import Notice from "./Notice";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.headers.post["Content-Type"] = "application/json";

function ConfirmImg({
  setIsImgConfirmed,
  imgDataURL,
  faceData,
  sendRegisterConfirmation,
  isOldUser,
}) {
  const imgRef = useRef(null);
  const yesSpanRef = useRef(null);
  const noSpanRef = useRef(null);
  const [promptUserName, setPromptUserName] = useState(null);
  const [isOldUname, setIsOldUname] = useState(false);
  const [placeHolderText, setPlaceHolderText] = useState("Enter a username");
  const inputUnameRef = useRef(null);
  const confirmText = "Confirm this as your ID photo?";

  const buttonObjs = [
    {
      text: "Yes",
      hoverText: "Proceed",
      spnRef: yesSpanRef,
      onHover: function () {
        buttonObjs[0].spnRef.current.textContent = buttonObjs[0].hoverText;
      },
      onNoHover: function () {
        buttonObjs[0].spnRef.current.textContent = buttonObjs[0].text;
      },
      clickHandler: function () {
        setPromptUserName(true);
      },
    },
    {
      text: "No",
      hoverText: "Retake",
      spnRef: noSpanRef,
      onHover: function () {
        buttonObjs[1].spnRef.current.textContent = buttonObjs[1].hoverText;
      },
      onNoHover: function () {
        buttonObjs[1].spnRef.current.textContent = buttonObjs[1].text;
      },
      clickHandler: function () {
        setIsImgConfirmed(false);
        sendRegisterConfirmation(false);
      },
    },
  ];

  function makeRegisterRequest() {
    if (inputUnameRef !== null && inputUnameRef.current.value.length > 0) {
      const postData = {
        uname: inputUnameRef.current.value,
        faceData: faceData,
        credentials: [],
      };
      console.log("BEFORE REGISTER REQ");

      chrome.runtime
        .sendMessage({ action: "register", postData: postData })
        .then((res) => {
          if (res.msg == "registered") {
            sendRegisterConfirmation(true);
            isOldUser(false);
          } else if (res.msg == "oldUser") {
            sendRegisterConfirmation(null);
            isOldUser(true);
          } else if (res.msg == "oldUname") {
            setIsOldUname(true);
          }
        })
        .catch((err) => {
          console.log(err);
        });

      setIsImgConfirmed(true);
    }
  }

  useEffect(() => {
    imgRef.current.src = imgDataURL;
  }, []);

  useEffect(() => {
    yesSpanRef.current.textContent = buttonObjs[0].text;
    noSpanRef.current.textContent = buttonObjs[1].text;
  }, []);

  useEffect(() => {
    if (isOldUname) {
      inputUnameRef.current.value = "";
      setPlaceHolderText("Select another username");
    }
  }, [isOldUname]);

  if (promptUserName !== true) {
    return (
      <>
        <div className="flex flex-col items-center w-full h-fit space-y-7">
          <img ref={imgRef} className="w-full rounded-lg aspect-square" />
          <Notice text={confirmText} />
          <div className="flex flex-row w-full h-fit space-x-3">
            {buttonObjs.map((btnObj) => {
              return (
                <>
                  <button
                    className="bg-black border border-2 border-black text-lg rounded rounded-lg text-white hover:bg-white hover:text-black font-bold w-full h-12"
                    onMouseEnter={btnObj.onHover}
                    onMouseLeave={btnObj.onNoHover}
                    onClick={btnObj.clickHandler}>
                    <span ref={btnObj.spnRef}></span>
                  </button>
                </>
              );
            })}
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="flex flex-col items-center w-full h-fit space-y-10">
          <img ref={imgRef} className="w-full rounded-lg aspect-square" />
          <div className="w-full flex flex-row h-fit space-x-1">
            <input
              type="text"
              placeholder={placeHolderText}
              name="uname"
              id="uname"
              ref={inputUnameRef}
              className="border-2 border-black text-lg rounded-lg bg-white text-black text-center font-bold h-16 p-2 focus:ring focus:border-blue-500 focus:border-none basis-10/12"
            />
            <button
              className="h-16 flex items-center justify-center font-bold p-2 bg-black hover:bg-white text-white hover:text-black text-lg rounded-lg border-2 border-black basis-2/12"
              onClick={makeRegisterRequest}>
              <FaArrowUpFromBracket className="h-5 w-5" />
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default ConfirmImg;
