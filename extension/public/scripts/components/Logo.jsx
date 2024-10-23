/**
 * React component to display extension logo.
 * @returns extension logo jsx
 */
function Logo() {
  return (
    <>
      <div className="flex rounded-2xl items-center w-fit h-fit space-x-2">
        <div className="border-2 border-black rounded-full">
          <img
            className="w-8 object-cover rounded-full"
            src="../images/logo.png"></img>
        </div>
        <div className="rounded-md">
          <span className="text-lg font-logo font-extrabold"> peephole</span>
        </div>
      </div>
    </>
  );
}

export default Logo;
