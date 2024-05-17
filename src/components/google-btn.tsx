import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Button, Logo } from "./auth-components";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function GoogleButton() {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <Button onClick={onClick} bgColor="#a49ca3">
      <Logo src="/google-color-icon.webp" />
      <span>Continue with Google</span>
    </Button>
  );
}
