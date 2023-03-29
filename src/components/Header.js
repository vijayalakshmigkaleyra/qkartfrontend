import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory,Link } from "react-router-dom";

const Header = ({ children, hasHiddenAuthButtons }) => {
  let history= useHistory();
  let token=localStorage.getItem("token");
  let username=localStorage.getItem("username");
  let balance=localStorage.getItem("balance");

  let handleLogout=()=>{
    history.push("/");
    history.go();
    localStorage.clear();
  };
    return (
      <Box className="header">
        <Box className="header-title">
          <Link to="/">
          <img src="logo_light.svg" alt="QKart-icon"></img>
          </Link> 
        </Box>
        {hasHiddenAuthButtons?(
            <Button
            className="explore-button"
            startIcon={<ArrowBackIcon />}
            variant="text"
            onClick={()=>history.push("/")}
          >
            Back to explore
          </Button>
        ):!username?(
          <>
          <Box width="30vm">{children && children}</Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button className="explore-button"
            onClick={()=>{
              history.push("/login");
            }}
            >
              Login
            </Button>
            <Button className="b"
               variant="contained"
               onClick={()=>{
                history.push("/register");
               }}
               >
                Register
               </Button>
          </Stack>
          </>
        ):(
          <>
          <Box width="30vm">{children && children}</Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src="../../public/avatar.png" alt={username}/>
            <p>{username}</p>
            <Button className="explore-button" onClick={handleLogout}>Logout</Button>
          </Stack>
          </>
        )}
     
      </Box>
    );
};

export default Header;
