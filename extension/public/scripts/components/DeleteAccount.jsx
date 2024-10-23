import { IoPersonRemoveOutline } from "react-icons/io5";

/**
 *React component to display icon for account deletion.
 * @returns icon jsx for account deletion
 */
function DeleteAccount() {
  return (
    <>
      <IoPersonRemoveOutline title="Delete your account" className="h-5 w-5" />
    </>
  );
}

export default DeleteAccount;
