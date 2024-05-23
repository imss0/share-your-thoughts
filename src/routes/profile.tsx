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
  updateDoc,
  where,
} from "firebase/firestore";
import { IPost } from "../components/timeline";
import Post, { Btn } from "../components/post";
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
  font-family: "Poetsen One", sans-serif;
  i {
    font-size: 12px;
    margin-left: 10px;
    color: gray;
  }
`;
const Form = styled.form``;
const NameInput = styled.input`
  border: 1px solid #ecc64d;
  border-radius: 10px;
  height: 30px;
  font-family: "nunito", sans-serif;
`;

const Posts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export default function Profile() {
  const { profileUserId } = useParams();
  const [username, setUsername] = useState("");

  const user = auth.currentUser;
  const [avatar, setAvatar] = useState("");
  const [posts, setPosts] = useState<IPost[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(username);

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

  const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  };

  const onEdit = async () => {
    if (user?.uid !== profileUserId) return;
    try {
      setEditMode(true);
    } catch (e) {
      console.error(e);
    }
  };

  const onSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editedName) return;
    try {
      const docRef = doc(db, "users", user?.uid as string);
      await updateDoc(docRef, {
        username: editedName,
      });
      if (user) {
        await updateProfile(user, {
          displayName: editedName,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEditMode(false);
    }
  };

  useEffect(() => {
    let unsubcribe: Unsubscribe | null;
    let unsubscribeProfile: Unsubscribe | null;

    const fetchUserInfo = async () => {
      const userQuery = query(
        collection(db, "users"),
        where("userId", "==", profileUserId)
      );

      unsubscribeProfile = onSnapshot(userQuery, async (snapshot) => {
        const userData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const { username } = doc.data();
            return username;
          })
        );
        setUsername(userData[0]);
      });
    };

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

    const fetchPosts = async () => {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", profileUserId),
        orderBy("createdAt", "desc"),
        limit(30)
      );
      unsubcribe = await onSnapshot(postsQuery, async (snapshot) => {
        const queryResult = await Promise.all(
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
        setPosts(queryResult);
      });
    };

    const initializeProfile = async () => {
      await fetchUserInfo();
      await fetchPosts();
      const avatarUrl = await fetchAvatarUrl(profileUserId as string);
      if (avatarUrl) {
        setAvatar(avatarUrl);
      }
    };

    initializeProfile();

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
          <Name>{user?.displayName ?? "noname"} </Name>
          {user?.uid === profileUserId && !editMode ? (
            <Btn onClick={onEdit} bgcolor="#1e98f9">
              edit
            </Btn>
          ) : null}
          {editMode ? (
            <Form onSubmit={onSave}>
              <NameInput onChange={onChangeText} value={editedName} />
              <Btn type="submit" value="Save">
                save
              </Btn>
            </Form>
          ) : null}
        </>
      ) : (
        <>
          {avatar ? (
            <AvatarUpload>
              <AvatarImg src={avatar} />
            </AvatarUpload>
          ) : (
            <i className="fa-solid fa-user"></i>
          )}

          <Name>{username ?? "noname"}</Name>
        </>
      )}

      <Posts>
        {posts.map((post) => (
          <Post key={post.id} {...post} />
        ))}
      </Posts>
    </Wrapper>
  );
}
