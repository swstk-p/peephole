/**
 *React component to display a single instruction.
 * @param {*} param0 props
 * @returns jsx for instruction
 */
function Instruction({ directionElem, direction, imgSrc }) {
  let imgComponent =
    imgSrc === null ? null : (
      <img src={imgSrc} className=" w-full h-20 object-cover rounded-lg" />
    );
  let directionComponent =
    directionElem === true ? direction : <span>{direction}</span>;
  return (
    <>
      <div className="text-base w-full h-fit flex flex-col items-start space-y-1 rounded-md">
        {directionComponent}
        {imgComponent}
      </div>
    </>
  );
}

export default Instruction;
