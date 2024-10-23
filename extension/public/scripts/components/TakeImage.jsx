import { useState } from "react";

/**
 *
 * @param {*} param0 parent component function to set registerState
 * @returns React component for a button that clicks photo
 */
function TakeImage({ registerConfirmStateFunc, forUpdate }) {
  const originalPrompt = forUpdate == true ? "Update" : "Create account";
  const hoverPrompt = forUpdate == true ? "Capture" : "Take photo";
  const [prompt, setPrompt] = useState(originalPrompt);

  const onHover = () => {
    setPrompt(hoverPrompt);
  };

  const onNoHover = () => {
    setPrompt(originalPrompt);
  };

  if (forUpdate !== true) {
    return (
      <>
        <button
          className="bg-black border border-2 border-black text-xl rounded rounded-lg text-white hover:bg-white hover:text-black font-bold w-full h-14"
          onMouseEnter={onHover}
          onMouseLeave={onNoHover}
          onClick={() => {
            forUpdate
              ? registerConfirmStateFunc((prev) => !prev)
              : registerConfirmStateFunc(true);
          }}>
          <span> {prompt} </span>{" "}
        </button>{" "}
      </>
    );
  } else {
    return (
      <>
        <button
          className="bg-black border border-2 border-black text-lg rounded rounded-lg text-white hover:bg-white hover:text-black font-bold w-full h-14"
          onMouseEnter={onHover}
          onMouseLeave={onNoHover}
          onClick={() => {
            forUpdate
              ? registerConfirmStateFunc((prev) => !prev)
              : registerConfirmStateFunc(true);
          }}>
          <span> {prompt} </span>{" "}
        </button>{" "}
      </>
    );
  }
}

export default TakeImage;
