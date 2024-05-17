import React, { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  Wrapper,
  Title,
  Form,
  Input,
  Switcher,
  Error,
  SocialLoginWrapper,
  LineWrapper,
  Line,
  MainText,
} from "../components/auth-components";
import GithubButton from "../components/github-btn";
import GoogleButton from "../components/google-btn";
import { useForm } from "react-hook-form";

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormData>();
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const onSubmit = async (formData: FormData) => {
    const { email, password } = formData;
    setError("");
    if (isLoading || email === "" || password === "") return;
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setError("");
    setIsForgotPassword(true);
  };

  const handleResetPassword = async () => {
    setError("");
    if (isLoading || resetEmail.trim() === "") return;
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setIsForgotPassword(false);
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Speak up!</Title>
      <MainText>Welcome! How do you want to get started?</MainText>
      <SocialLoginWrapper>
        <GithubButton />
        <GoogleButton />
      </SocialLoginWrapper>
      <LineWrapper>
        <Line />
        <span>or</span>
        <Line />
      </LineWrapper>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("email", { required: true })}
          name="email"
          placeholder="Email"
          type="email"
        />
        <Input
          {...register("password", { required: true })}
          name="password"
          placeholder="Password"
          type="password"
        />
        <Input type="submit" value={isLoading ? "Loading" : "Log in"} />
      </Form>
      {error && <Error>{error}</Error>}
      <Switcher>
        Forgot password?
        <a href="#" onClick={resetPassword}>
          Reset password &rarr;
        </a>
        {isForgotPassword && (
          <Form>
            <Input
              placeholder="Email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <Input
              type="button"
              value={isLoading ? "Sending" : "Send reset email"}
              onClick={handleResetPassword}
            />
          </Form>
        )}
      </Switcher>
      <Switcher>
        Don't have an account? <Link to="/signup">Create one &rarr;</Link>
      </Switcher>
    </Wrapper>
  );
}
