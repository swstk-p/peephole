import Instruction from "./Instruction";

/**
 * React component to display instructions for enabling web cam.
 * @returns instrctions jsx
 */
function CameraInstructions() {
  let instructions = [
    {
      directionElem: true,
      direction: (
        <span>
          1. Go to{" "}
          <a
            href="#"
            onClick={() => {
              // create a new tab for the settings
              chrome.tabs.create({
                url:
                  "chrome://settings/content/siteDetails?site=chrome-extension://" +
                  chrome.runtime.id,
              });
            }}
            className="hover:text-rose-400 underline font-semibold text-underline">
            extension settings
          </a>
          .
        </span>
      ),
      imgSrc: null,
    },
    {
      directionElem: false,
      direction: "2. Navigate to the Privacy and security setting.",
      imgSrc: "../../images/instruction1.png",
    },
    {
      directionElem: false,
      direction: "3. Locate the camera section.",
      imgSrc: "../../images/instruction2.png",
    },
    {
      directionElem: false,
      direction: "4. Set the permission to Allow.",
      imgSrc: "../../images/instruction3.png",
    },
  ];
  return (
    <>
      <div className="flex flex-col items-center w-full h-fit rounded-lg">
        <p className="text-xs w-full font-semibold">
          This extension needs to access your device's camera to see you.
        </p>
        <div className="space-y-6 mt-7 mb-2 flex flex-col items-start w-full h-fit rounded-lg">
          {instructions.map(function (data) {
            return (
              <Instruction
                directionElem={data.directionElem}
                direction={data.direction}
                imgSrc={data.imgSrc}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

export default CameraInstructions;
