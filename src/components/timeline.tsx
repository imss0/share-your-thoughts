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
import { db, storage } from "../firebase";
import Post from "./post";
import { getDownloadURL, ref } from "firebase/storage";

export interface IPost {
  id: string;
  attachment?: string;
  content: string;
  userId: string;
  username: string;
  createdAt: number;
  edited: boolean;
  editedAt?: number;
  avatar?: string | null;
}

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  overflow-y: scroll;
`;

export default function Timeline() {
  const [posts, setPosts] = useState<IPost[]>([]);

  const fetchAvatarUrl = async (userId: string) => {
    try {
      const avatarRef = ref(storage, `avatars/${userId}`);
      const avatarUrl = await getDownloadURL(avatarRef);
      return avatarUrl;
    } catch (e) {
      console.error("Error fetching avatar URL:", e);
      return null;
    }
  };

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    const fetchPosts = async () => {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(30)
      );

      unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
        const postsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const {
              attachment,
              content,
              userId,
              username,
              createdAt,
              edited,
              editedAt,
            } = doc.data();

            const avatar = await fetchAvatarUrl(userId);

            return {
              id: doc.id,
              attachment,
              content,
              userId,
              username,
              createdAt,
              edited,
              editedAt,
              avatar,
            };
          })
        );

        setPosts(postsData);
      });
    };

    fetchPosts();

    return () => {
      unsubscribe && unsubscribe();
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
