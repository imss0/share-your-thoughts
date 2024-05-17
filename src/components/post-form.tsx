import React, { useState } from "react";
import { styled } from "styled-components";
import { Form } from "./auth-components";
import { addDoc, collection, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const TextArea = styled.textarea`
  border: 1px solid white;
  padding: 20px;
  border-radius: 5px;
  font-size: 12px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  &::placeholder {
    font-size: 10px;
  }
  &:focus {
    outline: none;
    border-color: lightgreen;
  }
`;
const AttachFileBtn = styled.label`
  padding: 6px;
  color: hotpink;
  text-align: center;
  border-radius: 5px;
  border: 1px solid hotpink;
  font-size: 14px;
  height: 30px;
  font-weight: 600;
  cursor: pointer;
`;
const AttachFileInput = styled.input`
  display: none;
`;
const SubmitBtn = styled.input`
  background-color: hotpink;
  color: white;
  border: none;
  padding: 6px;
  border-radius: 5px;
  font-size: 14px;
  height: 30px;
  font-weight: 600;
  font-family: Consolas, monaco, monospace;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

export default function PostForm() {
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(e.target.value);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      if (files[0].size / 1000000 < 2) setFile(files[0]);
      else {
        alert("File size should be less than 2MB");
        setFile(null);
      }
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (isLoading || !user || tweet === "" || tweet.length > 200) return;
    try {
      setLoading(true);
      const doc = await addDoc(collection(db, "posts"), {
        content: tweet,
        createdAt: Date.now(),
        username: user.displayName || "noname",
        userId: user.uid,
      });
      if (file) {
        const locationRef = ref(
          storage,
          `posts/${user.uid}-${user.displayName}/${doc.id}`
        );
        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);
        await updateDoc(doc, { attachment: url });
      }
      setTweet("");
      setFile(null);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form onSubmit={onSubmit}>
      <TextArea
        onChange={onChange}
        value={tweet}
        placeholder="What is happening"
        rows={5}
        maxLength={200}
      />
      <AttachFileBtn htmlFor="file">
        {file ? "Photo added" : "Add photo"}
      </AttachFileBtn>
      <AttachFileInput
        onChange={onFileChange}
        type="file"
        id="file"
        accept="image/*"
      />
      <SubmitBtn type="submit" value={isLoading ? "Posting..." : "Post"} />
    </Form>
  );
}
