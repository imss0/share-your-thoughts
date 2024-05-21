import { styled } from "styled-components";

interface ButtonProps {
  bgcolor?: string;
}

export const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60%;
  padding: 50px 0px;
`;

export const Title = styled.div`
  font-size: 28px;
  color: #ecc64d;
  font-family: "Poetsen One", sans-serif;
`;

export const MainText = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-top: 50px;
  margin-bottom: 20px;
`;

export const Form = styled.form`
  margin-top: 50px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;
export const Input = styled.input`
  padding: 10px;
  background-color: transparent;
  color: black;
  border-width: 0 0 1px;
  width: 88%;
  align-self: center;
  font-size: 14px;
  font-family: "Nunito", sans-serif;
  &[type="submit"],
  &[type="button"] {
    background-color: #ecc64d;
    text-align: center;
    font-weight: 600;
    margin-top: 12px;
    cursor: pointer;
    &:hover {
      opacity: 0.7;
      font-weight: 800;
    }
    width: 260px;
    color: white;
    padding: 7px 5px;
    border-radius: 20px;
    border: 0;
    font-size: 15px;
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: center;
    align-self: center;
  }
`;

export const Error = styled.span`
  font-size: 10px;
  color: #cc5555;
`;

export const Switcher = styled.span`
  margin-top: 20px;
  a {
    color: darkgray;
    margin-left: 10px;
    text-decoration: none;
  }
`;

export const Button = styled.span<ButtonProps>`
  background-color: ${(props) => props.bgcolor || "#ecc64d"};
  text-align: center;
  font-weight: 600;
  margin-top: 12px;
  cursor: pointer;
  &:hover {
    opacity: 0.7;
    font-weight: 800;
  }
  width: 260px;
  color: white;
  padding: 7px 5px;
  border-radius: 20px;
  border: 0;
  font-size: 15px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
`;

export const Logo = styled.img`
  height: 25px;
`;

export const SocialLoginWrapper = styled.div`
  width: 100%;
  margin-top: 70px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const LineWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 10;
  height: 0px;
  margin-top: 30px;
`;

export const Line = styled.hr`
  width: 35%;
  height: 0;
  color: gray;
`;
