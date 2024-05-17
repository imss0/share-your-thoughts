import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import PostForm from "../components/post-form";
import { styled } from "styled-components";
import Timeline from "../components/timeline";

const Wrapper = styled.div`
  display: grid;
  gap: 50px;
  overflow-y: scroll;
  grid-template-rows: 1fr 5fr;
  height: 100vh;
`;

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
        <Timeline />
        <PostForm />
      </Wrapper>

      <button onClick={logOut}>Log Out</button>
    </>
  );
}
