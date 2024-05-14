import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  Wrapper,
  Title,
  Form,
  Input,
  Switcher,
  Error,
} from "../components/auth-components";
import GithubButton from "../components/github-btn";
import GoogleButton from "../components/google-btn";

type FormData = {
  [key: string]: string;
};

export default function Signup() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();
  const [firebaseError, setFirebaseError] = useState("");

  const onSubmit = async (formData: FormData) => {
    const { name, email, password } = formData;
    setFirebaseError("");
    if (isLoading || email === "" || password === "") return;
    try {
      setLoading(true);
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(credentials.user, {
        displayName: name,
      });
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        setFirebaseError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Join Share My Thoughts</Title>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("name", {
            required: true,
          })}
          name="name"
          placeholder="Name"
          type="text"
        />
        <Input
          {...register("email", {
            required: true,
          })}
          name="email"
          placeholder="Email"
          type="email"
        />
        <Input
          {...register("password", {
            required: true,
          })}
          name="password"
          placeholder="Password"
          type="password"
        />
        <Input type="submit" value={isLoading ? "Loading" : "Sign Up"} />
      </Form>
      {firebaseError !== "" ? <Error>{firebaseError}</Error> : null}
      <Switcher>
        Already have an account? <Link to="/login">Log in &rarr;</Link>
      </Switcher>
      <GithubButton />
      <GoogleButton />
    </Wrapper>
  );
}
