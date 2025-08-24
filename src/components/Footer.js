import React from 'react';
import { Typography, Link as MuiLink, Box } from '@mui/material';

function Footer() {
  return (
    <footer>
      <Box
        sx={{
          py: 4,
          backgroundColor: '#0f172a',
          color: '#f1f5f9',
          textAlign: 'center',
          borderTop: '1px solid #334155',
        }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          <MuiLink href="/about" color="inherit" underline="hover" sx={{ mx: 1 }}>
            About Us
          </MuiLink>
          |
          <MuiLink href="/contact" color="inherit" underline="hover" sx={{ mx: 1 }}>
            Contact
          </MuiLink>
          |
          <MuiLink href="https://twitter.com" color="inherit" underline="hover" sx={{ mx: 1 }} target="_blank" rel="noopener noreferrer">
            Twitter
          </MuiLink>
        </Typography>
        <Typography variant="body1">
          &copy; {new Date().getFullYear()} Travel Blog Platform. All rights reserved.
        </Typography>
      </Box>
    </footer>
  );
}

export default Footer;
