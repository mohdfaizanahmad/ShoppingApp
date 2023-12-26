import * as React from "react";
import { TextField, Button, Box, Typography, Container } from "@mui/material";

import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminLogIn = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const navigate = useNavigate();
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/shopOwner/logIn", {
        email: email,
        password: password,
      });
      setEmail("");
      setPassword("");
      console.log(res?.data);
      if (res?.data?.status === "success") {
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          marginTop: 4,
          border: "2px solid gray",
          borderRadius: "10px",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box
          sx={{
            marginTop: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="E-mail"
              variant="outlined"
              value={email}
              onChange={handleEmailChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={handlePasswordChange}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              LogIn
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default AdminLogIn;
