import { auth } from "../firebase";
import PostForm from "../components/post-form";
import { styled } from "styled-components";
import Timeline from "../components/timeline";
import { Title } from "../components/auth-components";

const Wrapper = styled.div`
  display: grid;
  gap: 15px;
  overflow-y: scroll;
  grid-template-rows: 1fr 2fr 5fr;
  height: 100vh;
`;

const MiddleText = styled.div`
  font-family: "Poetsen One", sans-serif;
  margin: 0;
`;

export default function Home() {
  return (
    <>
      <Wrapper>
        <Title>Speak up 😜</Title>
        <MiddleText>
          Hello, {auth.currentUser?.displayName}! What's going on?
        </MiddleText>
        <PostForm />
        <Timeline />
      </Wrapper>
    </>
  );
}
