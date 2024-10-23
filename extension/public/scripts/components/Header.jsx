import Logo from "./Logo";
import Navbar from "./Navbar";

/**
 * React component to display the extension header.
 * @returns jsx to display header components
 */
function Header({ isLoggedIn }) {
  return (
    <>
      <div className="px-5 rounded-lg flex py-1 w-full justify-between">
        <Logo />
        <Navbar isLoggedIn={isLoggedIn} />
      </div>{" "}
    </>
  );
}

export default Header;
