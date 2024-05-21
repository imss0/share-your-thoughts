import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Unsubscribe, updateProfile } from "firebase/auth";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { IPost } from "../components/timeline";
import Post from "../components/post";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
  overflow-y: scroll;
`;

const AvatarUpload = styled.label`
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 40px;
  background-color: #ecc64d;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  i {
    font-size: 30px;
    color: #f4f4f4;
  }
`;
const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 20px;
`;

const Posts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export default function Profile() {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [posts, setPosts] = useState<IPost[]>([]);
  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!user) return;
    if (files && files.length === 1) {
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`);
      const result = await uploadBytes(locationRef, file);
      const avatarUrl = await getDownloadURL(result.ref);
      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };

  useEffect(() => {
    let unsubcribe: Unsubscribe | null;
    const fetchPosts = async () => {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", user?.uid),
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
      <AvatarUpload htmlFor="avatar">
        {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
          <i className="fa-solid fa-user"></i>
        )}
      </AvatarUpload>
      <AvatarInput
        onChange={onChange}
        id="avatar"
        type="file"
        accept="image/*"
      />
      <Name>{user?.displayName ?? "noname"}</Name>
      <Posts>
        {posts.map((post) => (
          <Post key={post.id} {...post} />
        ))}
      </Posts>
    </Wrapper>
  );
}
