function Instruction({ directionElem, direction, imgSrc }) {
  let imgComponent =
    imgSrc === null ? null : (
      <img src={imgSrc} className="w-full h-24 object-cover rounded-lg" />
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