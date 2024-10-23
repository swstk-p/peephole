import { useEffect, useState } from "react";

/**
 * React component to display online status indicator.
 * @returns online indicator jsx
 */
function OnlineStatus({ isLoggedIn }) {
  const [divClass, setDivClass] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      setDivClass("rounded-full w-4 h-4 bg-lime-500");
    } else {
      setDivClass("rounded-full w-4 h-4 bg-red-500");
    }
  }, [isLoggedIn]);
  return (
    <>
      <div title="Online" className={divClass}></div>
    </>
  );
}

export default OnlineStatus;
