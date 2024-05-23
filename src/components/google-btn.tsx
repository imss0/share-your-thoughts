import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Button, Logo } from "./auth-components";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

export default function GoogleButton() {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        name: user.displayName || "noname",
        createdAt: Date.now(),
        edited: false,
        userId: user.uid,
      });

      navigate("/");
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <Button onClick={onClick} bgcolor="#a49ca3">
      <Logo src="/google-color-icon.webp" />
      <span>Continue with Google</span>
    </Button>
  );
}
