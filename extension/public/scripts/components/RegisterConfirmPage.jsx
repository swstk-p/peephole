import { useEffect, useState } from "react";
import ConfirmImg from "./ConfirmImg";

function RegisterConfirmPage({
  imgDataURL,
  faceData,
  sendRegisterConfirmation,
  isOldUser,
}) {
  const [imgConfirmed, setImgConfirmed] = useState(null);

  function getImgConfirmation(confirmed) {
    setImgConfirmed(confirmed);
  }

  // useEffect(() => {
  //   if (imgConfirmed !== null && imgConfirmed == false) {
  //     sendRegisterConfirmation(false);
  //   } else if (imgConfirmed == true) {
  //     sendRegisterConfirmation(true);
  //   }
  // }, [imgConfirmed]);

  return (
    <>
      <ConfirmImg
        setIsImgConfirmed={getImgConfirmation}
        imgDataURL={imgDataURL}
        faceData={faceData}
        sendRegisterConfirmation={sendRegisterConfirmation}
        isOldUser={isOldUser}
      />
    </>
  );
}

export default RegisterConfirmPage;
