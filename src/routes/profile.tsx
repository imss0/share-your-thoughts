import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Unsubscribe, updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { IPost } from "../components/timeline";
import Post from "../components/post";
import { useParams } from "react-router-dom";

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
  const { profileUserId } = useParams();
  const [userData, setUserData] = useState({});

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
    let unsubscribeProfile: Unsubscribe | null;

    const fetchUserData = async () => {
      // const userRef = doc(db, "users", profileUserId);
      const userQuery = query(
        collection(db, "users"),
        where("userId", "==", profileUserId)
      );
      unsubscribeProfile = onSnapshot(userQuery, async (snapshot) => {
        const userData = snapshot.docs.map(async (doc) => doc.data());
        setUserData(userData);
      });
    };
    const fetchPosts = async () => {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", profileUserId),
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
    fetchUserData();
    fetchPosts();
    return () => {
      unsubscribeProfile && unsubscribeProfile();
      unsubcribe && unsubcribe();
    };
  }, [profileUserId]);

  return (
    <Wrapper>
      {user?.uid === profileUserId ? (
        <>
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
        </>
      ) : null}

      <Posts>
        {posts.map((post) => (
          <Post key={post.id} {...post} />
        ))}
      </Posts>
    </Wrapper>
  );
}
