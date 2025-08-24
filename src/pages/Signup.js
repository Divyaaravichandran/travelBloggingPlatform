import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    profilePicture: null,
  });

  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture") {
      setFormData({ ...formData, profilePicture: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Validate form fields
  const validate = () => {
    let newErrors = {};
    if (!formData.username.trim())
      newErrors.username = "Username is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (!formData.country.trim())
      newErrors.country = "Country is required";

    return newErrors;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // 🔑 Use FormData for file upload
      const dataToSend = new FormData();
      dataToSend.append("username", formData.username);
      dataToSend.append("email", formData.email);
      dataToSend.append("password", formData.password);
      dataToSend.append("phone", formData.phone);
      dataToSend.append("country", formData.country);
      if (formData.profilePicture) {
        dataToSend.append("profilePicture", formData.profilePicture);
      }

      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        body: dataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Signup successful!");
        navigate("/login");
      } else {
        alert(result.message || "❌ Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error connecting to server");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(2px)",
        },
        overflowY: "auto",
        py: 4,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: { xs: 320, sm: 400 },
          borderRadius: 3,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          zIndex: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: "1.5rem", sm: "2rem" },
            background: "linear-gradient(90deg, #8fb7c7ff, #f1d245ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Sign Up
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />

          {/* Email */}
          <TextField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />

          {/* Password */}
          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />

          {/* Confirm Password */}
          <TextField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />

          {/* Phone */}
          <TextField
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />

          {/* Country */}
          <TextField
            select
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            error={!!errors.country}
            helperText={errors.country}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="India">India</MenuItem>
            <MenuItem value="USA">USA</MenuItem>
            <MenuItem value="UK">UK</MenuItem>
            <MenuItem value="Canada">Canada</MenuItem>
          </TextField>

          {/* Profile Picture Upload */}
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              mb: 3,
              textTransform: "none",
              borderColor: "#1e293b",
              color: "#1e293b",
              "&:hover": { borderColor: "#334155", color: "#334155" },
            }}
          >
            {formData.profilePicture
              ? formData.profilePicture.name
              : "Upload Profile Picture"}
            <input
              type="file"
              name="profilePicture"
              hidden
              onChange={handleChange}
            />
          </Button>

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#1e293b",
              "&:hover": { backgroundColor: "#334155" },
              py: { xs: 1, sm: 1.2 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: "bold",
            }}
          >
            Sign Up
          </Button>

          {/* Login Link */}
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              textAlign: "center",
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Already have an account?{" "}
            <Link
              component="button"
              onClick={() => navigate("/login")}
              underline="hover"
            >
              Login
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}

export default Signup;
