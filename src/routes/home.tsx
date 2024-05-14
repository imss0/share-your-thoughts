import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function Home() {
  const navigate = useNavigate();
  const logOut = () => {
    auth.signOut();
    navigate("/login");
  };

  return (
    <h1>
      <div>Hello, {auth.currentUser?.displayName}👋</div>
      <button onClick={logOut}>Log Out</button>
    </h1>
  );
}
