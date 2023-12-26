import * as React from "react";
import { TextField, Button, Box, Typography, Container } from "@mui/material";

import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    pincode: "",
    state: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/costumer/signUp", formData);
      console.log(res?.data);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        pincode: "",
        state: "",
      });
      if (res?.data?.status === "success") {
        navigate("/login");
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
          marginTop: 2,
          border: "2px solid gray",
          borderRadius: "10px",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box
          sx={{
            marginTop: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            SignUp
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="dense"
              required
              fullWidth
              size="small"
              label="Name"
              variant="outlined"
              name="name"
              value={formData?.name}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              size="small"
              label="E-mail"
              variant="outlined"
              name="email"
              value={formData?.email}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              size="small"
              label="Password"
              type="password"
              variant="outlined"
              name="password"
              value={formData?.password}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              size="small"
              label="Phone"
              variant="outlined"
              name="phone"
              value={formData?.phone}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              size="small"
              label="Address"
              variant="outlined"
              name="address"
              value={formData?.address}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              size="small"
              label="Pincode"
              variant="outlined"
              name="pincode"
              value={formData?.pincode}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              size="small"
              label="State"
              variant="outlined"
              name="state"
              value={formData?.state}
              onChange={handleInputChange}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
            >
              SignUp
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default SignUp;
