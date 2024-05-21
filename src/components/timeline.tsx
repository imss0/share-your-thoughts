import {
  Unsubscribe,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { db } from "../firebase";
import Post from "./post";

export interface IPost {
  id: string;
  attachment?: string;
  content: string;
  userId: string;
  username: string;
  createdAt: number;
  edited: boolean;
  editedAt?: number;
}

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  overflow-y: scroll;
`;

export default function Timeline() {
  const [posts, setPosts] = useState<IPost[]>([]);

  useEffect(() => {
    let unsubcribe: Unsubscribe | null;
    const fetchPosts = async () => {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(30)
      );
      unsubcribe = await onSnapshot(postsQuery, (snapshot) => {
        const queryResult = snapshot.docs.map((doc) => {
          const {
            attachment,
            content,
            userId,
            username,
            createdAt,
            edited,
            editedAt,
          } = doc.data();
          return {
            id: doc.id,
            attachment,
            content,
            userId,
            username,
            createdAt,
            edited,
            editedAt,
          };
        });
        setPosts(queryResult);
      });
    };
    fetchPosts();
    return () => {
      unsubcribe && unsubcribe();
    };
  }, []);
  return (
    <Wrapper>
      {posts.map((post) => (
        <Post key={post.id} {...post} />
      ))}
    </Wrapper>
  );
}
