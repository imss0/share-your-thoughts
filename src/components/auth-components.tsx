import { styled } from "styled-components";

export const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 380px;
  padding: 50px 0px;
`;
export const Title = styled.div`
  font-size: 18px;
  color: #bf82ba;
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
  padding: 10px 20px;
  background-color: transparent;
  color: #9bdbfe;
  border-width: 0 0 1px;
  width: 100%;
  font-size: 14px;
  font-family: Consolas, monaco, monospace;
  &[type="submit"] {
    border: 1px solid darkgray;
    border-radius: 10px;
    cursor: pointer-events;
    &:hover {
      background-color: #9bdbfe;
      color: #1f1f1f;
    }
  }
`;

export const Error = styled.span`
  font-size: 10px;
  color: #cc5555;
`;

export const Switcher = styled.span`
  margin-top: 20px;
  a {
    color: lightblue;
  }
`;

export const Button = styled.span`
  background-color: white;
  text-align: center;
  font-weight: 500;
  margin-top: 10px;
  cursor: pointer;
  &:hover {
    background-color: darkgray;
    font-weight: 800;
  }
  width: 50%;
  color: black;
  padding: 5px;
  border-radius: 10px;
  border: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
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
  margin-bottom: 20px;
`;

export const Line = styled.hr`
  width: 45%;
  height: 0;
  color: gray;
`;
