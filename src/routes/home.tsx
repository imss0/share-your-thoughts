import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import PostForm from "../components/post-form";
import { Wrapper } from "../components/auth-components";

export default function Home() {
  const navigate = useNavigate();
  const logOut = () => {
    auth.signOut();
    navigate("/login");
  };

  return (
    <>
      <Wrapper>
        <div>Hello, {auth.currentUser?.displayName}👋</div>
        <PostForm />
      </Wrapper>

      <button onClick={logOut}>Log Out</button>
    </>
  );
}
