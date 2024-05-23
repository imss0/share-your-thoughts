import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Unsubscribe, updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
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

const BtnContainer = styled.div`
  right: 10px;
  bottom: 8px;
  display: flex;
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

const TextInput = styled.textarea`
  width: 100%;
  border: 1px solid lightgray;
  border-radius: 15px;
  padding: 15px;
  font-family: "nunito", sans-serif;
`;

export default function Profile() {
  const { profileUserId } = useParams();
  const [username, setUsername] = useState("");

  const user = auth.currentUser;
  const [avatar, setAvatar] = useState("");
  const [posts, setPosts] = useState<IPost[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(username);
  const [bio, setBio] = useState("");
  const [editedBio, setEditedbio] = useState(bio);
  const [editBioMode, setEditBioMode] = useState(false);

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

  const onChangeBio = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedbio(e.target.value);
  };

  const onEdit = async () => {
    if (user?.uid !== profileUserId) return;
    try {
      setEditMode(true);
    } catch (e) {
      console.error(e);
    }
  };

  const onEditBio = async () => {
    if (user?.uid !== profileUserId) return;
    try {
      setEditBioMode(true);
    } catch (e) {
      console.error(e);
    }
  };

  const onSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(editedName, user);

    if (!editedName || !user) return;

    const docRef = doc(db, "users", user.uid);

    try {
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error(`Document with ID ${user.uid} does not exist`);
        return;
      }

      await updateDoc(docRef, {
        name: editedName,
      });

      if (user) {
        console.log({ user });
        await updateProfile(user, {
          displayName: editedName,
        });
      }
    } catch (e) {
      console.error("Error updating document: ", e);
    } finally {
      setEditMode(false);
    }
  };

  const onSaveBio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editedBio || !user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        bio: editedBio,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setEditBioMode(false);
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
            const { name, bio } = doc.data();
            return { name, bio };
          })
        );
        setUsername(userData[0].name);
        setBio(userData[0].bio);
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
    setBio(editedBio);

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
          <BtnContainer>
            {user?.uid === profileUserId && !editMode && !editBioMode ? (
              <Btn onClick={onEdit} bgcolor="#1e98f9">
                edit username
              </Btn>
            ) : null}
            {user?.uid === profileUserId && !editMode && !editBioMode ? (
              <Btn onClick={onEditBio} bgcolor="#36e2bd">
                set bio
              </Btn>
            ) : null}
          </BtnContainer>
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

      {user?.uid === profileUserId && editBioMode ? (
        <>
          <Form onSubmit={onSaveBio}>
            <TextInput
              placeholder="Tell me about yourself :)"
              onChange={onChangeBio}
              value={editedBio}
              rows={3}
              maxLength={400}
            />
            <Btn type="submit">save</Btn>
          </Form>
        </>
      ) : (
        <div>{bio}</div>
      )}

      <Posts>
        {posts.map((post) => (
          <Post key={post.id} {...post} />
        ))}
      </Posts>
    </Wrapper>
  );
}
