import { styled } from "styled-components";
import { IPost } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import dayjs from "dayjs";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid gray;
  border-radius: 15px;
`;
const Column = styled.div``;
const Username = styled.div`
  font-weight: 600;
  font-size: 15px;
`;
const TextContent = styled.p`
  margin: 10x 0px;
  font-size: 14px;
`;
const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const DeleteBtn = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  text-transform: uppercase;
  border-radius: 5px;
  width: 70px;
  cursor: pointer;
`;

export default function Post({
  id,
  userId,
  username,
  attachment,
  content,
  createdAt,
}: IPost) {
  const user = auth.currentUser;
  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this post?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "posts", id));
      if (attachment) {
        const photoRef = ref(storage, `posts/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <TextContent>{dayjs(createdAt).format()} </TextContent>
        <TextContent>{content}</TextContent>
        {user?.uid === userId ? (
          <DeleteBtn onClick={onDelete}>delete</DeleteBtn>
        ) : null}
      </Column>
      <Column>{attachment ? <Photo src={attachment} /> : null}</Column>
    </Wrapper>
  );
}
