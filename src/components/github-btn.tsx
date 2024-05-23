import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { Button, Logo } from "./auth-components";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

export default function GithubButton() {
  const navigate = useNavigate();

  const onClick = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        name: user.displayName || "noname",
        createdAt: Date.now(),
        edited: false,
        username: user.displayName || "noname",
        userId: user.uid,
      });

      navigate("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Button bgcolor="black" onClick={onClick}>
      <Logo src="/github-logo.svg" />
      Continue with Github
    </Button>
  );
}
