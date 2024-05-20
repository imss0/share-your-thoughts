import { styled } from "styled-components";
import { IPost } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import dayjs from "dayjs";
import { useState } from "react";

interface ColorProps {
  bgColor?: string;
}

const Wrapper = styled.div<ColorProps>`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1.5px solid;
  border-color: ${(props) => props.bgColor || "#ecc64d"};
  border-radius: 15px;
  position: relative;
  min-height: 160px;
`;
const Column = styled.div``;
const Username = styled.div`
  font-weight: 600;
  font-size: 15px;
`;
const TextContent = styled.p`
  margin: 10px 0px;
  font-size: 14px;
`;
const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Btn = styled.button<ColorProps>`
  background-color: ${(props) => props.bgColor || "#ecc64d"};
  color: white;
  font-weight: 600;
  font-family: "Nunito", sans-serif;
  border: none;
  font-size: 14px;
  text-transform: uppercase;
  border-radius: 20px;
  width: 80px;
  height: 30px;
  margin: 2px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

const TextInput = styled.textarea`
  width: 100%;
  border: transparent;
  border-radius: 15px;
  outline: none;
  resize: none;
  font-family: "nunito", sans-serif;
`;

const BtnContainer = styled.div`
  position: absolute;
  right: 10px;
  bottom: 8px;
  display: flex;
  flex-direction: column;
`;

export const Form = styled.form``;

export default function Post({
  id,
  userId,
  username,
  attachment,
  content,
  createdAt,
}: IPost) {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isLoading, setLoading] = useState(false);
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

  const onEdit = async () => {
    if (user?.uid !== userId) return;
    try {
      setEditMode(true);
    } catch (e) {
      console.error(e);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };

  const onSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || editedContent.length > 400) return;
    try {
      setLoading(true);
      const docRef = doc(db, "posts", id);
      await updateDoc(docRef, {
        content: editedContent,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setEditMode(false);
    }
  };

  return (
    <Wrapper bgColor={editMode ? "#ecc64d" : "#dddddd"}>
      <Column>
        <Username>{username}</Username>
        <TextContent>{dayjs(createdAt).format()} </TextContent>
        {editMode ? (
          <TextInput
            onChange={onChange}
            value={editedContent}
            rows={3}
            maxLength={400}
          />
        ) : (
          <TextContent>{content}</TextContent>
        )}
        <BtnContainer>
          {user?.uid === userId && !editMode ? (
            <Btn onClick={onDelete} bgColor="tomato">
              delete
            </Btn>
          ) : null}
          {user?.uid === userId && !editMode ? (
            <Btn onClick={onEdit} bgColor="#1e98f9">
              edit
            </Btn>
          ) : null}
          {user?.uid === userId && editMode ? (
            <Form onSubmit={onSave}>
              <Btn type="submit" value="Save">
                save
              </Btn>
            </Form>
          ) : null}
        </BtnContainer>
      </Column>

      <Column>{attachment ? <Photo src={attachment} /> : null}</Column>
    </Wrapper>
  );
}
