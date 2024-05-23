import { styled } from "styled-components";
import { IPost } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { Link } from "react-router-dom";

dayjs.extend(relativeTime);
interface ColorProps {
  bgcolor?: string;
}

const Wrapper = styled.div<ColorProps>`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1.5px solid;
  border-color: ${(props) => props.bgcolor || "#ecc64d"};
  border-radius: 15px;
  position: relative;
`;
const Column = styled.div``;
const Username = styled.div`
  font-weight: 600;
  font-size: 15px;
`;

const Time = styled.span`
  margin: 10px 0px;
  font-size: 12px;
  color: gray;
`;
const TextContent = styled.p`
  margin: 10px 0px;
  font-size: 14px;
`;
const Photo = styled.img`
  width: 200px;
  height: 200px;
`;

const Btn = styled.button<ColorProps>`
  background-color: ${(props) => props.bgcolor || "#ecc64d"};
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

export const NameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AvatarImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

export default function Post({
  id,
  userId,
  username,
  attachment,
  content,
  createdAt,
  editedAt,
  edited,
  avatar,
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
    const currentTimestamp = Date.now();
    try {
      setLoading(true);
      const docRef = doc(db, "posts", id);
      await updateDoc(docRef, {
        content: editedContent,
        editedAt: currentTimestamp,
        edited: true,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setEditMode(false);
    }
  };

  return (
    <Wrapper bgcolor={editMode ? "#ecc64d" : "#dddddd"}>
      <Column>
        <NameContainer>
          {avatar ? (
            <Link to={`/profile/${userId}`}>
              <AvatarImg src={avatar} />
            </Link>
          ) : (
            <Link to={`/profile/${userId}`}>
              <i className="fa-solid fa-user"></i>
            </Link>
          )}
          <Username>{username}</Username>
          <Time>{dayjs(createdAt).fromNow()} </Time>
          {edited ? <Time>(edited {dayjs(editedAt).fromNow()})</Time> : null}
        </NameContainer>
        {attachment ? <Photo src={attachment} /> : null}
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
            <Btn onClick={onDelete} bgcolor="tomato">
              delete
            </Btn>
          ) : null}
          {user?.uid === userId && !editMode ? (
            <Btn onClick={onEdit} bgcolor="#1e98f9">
              edit
            </Btn>
          ) : null}
          {user?.uid === userId && editMode ? (
            <Form onSubmit={onSave}>
              <Btn type="submit" value="Save">
                {isLoading ? "saving..." : "save"}
              </Btn>
            </Form>
          ) : null}
        </BtnContainer>
      </Column>
    </Wrapper>
  );
}
