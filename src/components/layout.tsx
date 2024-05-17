import { Outlet, Link, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { auth } from "../firebase";

const Wrapper = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr 6fr 2fr;
  padding: 20px 0px;
  width: 100%;
`;
const Menu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;
const MenuItem = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: #f4f4f4;
  &:hover {
    background-color: #fee87f;
  }
  justify-content: center;
  font-size: 14px;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  i {
    color: #ecc64d;
  }
`;
export default function Layout() {
  const navigate = useNavigate();
  const onLogout = async () => {
    const ok = confirm("Are you sure you want to logout?");
    if (ok) {
      await auth.signOut();
      navigate("/login");
    }
  };
  return (
    <Wrapper>
      <Menu>
        <Link to="/">
          <MenuItem>
            <i className="fa-solid fa-house-chimney"></i>
          </MenuItem>
        </Link>
        <Link to="/profile">
          <MenuItem>
            {" "}
            <i className="fa-solid fa-user"></i>
          </MenuItem>
        </Link>

        <MenuItem onClick={onLogout} className="logout">
          <i className="fa-solid fa-door-open"></i>
        </MenuItem>
      </Menu>
      <Outlet />
    </Wrapper>
  );
}
