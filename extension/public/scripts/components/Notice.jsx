function Notice({ text }) {
  return (
    <>
      <div className="text-xs text-center w-full h-fit rounded-md">
        <span className="text-center font-semibold">{text}</span>
      </div>
    </>
  );
}

export default Notice;
