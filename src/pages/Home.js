import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  Paper,
  useTheme,
  Container,
} from '@mui/material';

import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PeopleIcon from '@mui/icons-material/People';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { useState, useEffect } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { IconButton } from '@mui/material';

const blogs = [
  { title: 'A Dreamy Escape to Santorini', image: '/images/card1.webp', description: 'Experience the blue domes and sunsets of Greece.' },
  { title: 'Adventures in the Swiss Alps', image: '/images/card2.jpg', description: 'Hiking, skiing, and breathtaking mountain views.' },
  { title: 'Maldives: Paradise on Earth', image: '/images/card3.jpg', description: 'Crystal clear waters and luxury resorts.' },
  { title: 'City Lights & Culture', image: '/images/card4.jpg', description: 'Explore vibrant city life and rich culture.' },
  { title: 'Hidden Gems for Travelers', image: '/images/card5.jpg', description: 'Discover off-the-beaten-path destinations.' },
];

const testimonials = [
  { name: 'Alice', photo: 'https://randomuser.me/api/portraits/women/1.jpg', quote: 'This platform inspired my solo trip to Japan!' },
  { name: 'Bob', photo: 'https://randomuser.me/api/portraits/men/2.jpg', quote: 'I found amazing travel tips and new friends here.' },
];

const stats = [
  { label: 'Blogs Shared', value: 1200, icon: <EditNoteIcon fontSize="large" color="primary" /> },
  { label: 'Destinations', value: 350, icon: <FlightTakeoffIcon fontSize="large" color="primary" /> },
  { label: 'Active Users', value: 8000, icon: <PeopleIcon fontSize="large" color="primary" /> },
];

const featuredCategories = [
  { image: '/images/travel1.jpg', title: 'Tower of Pisa' },
  { image: '/images/travel2.jpg', title: 'Breezy Beach' },
  { image: '/images/travel3.jpg', title: 'Maldives' },
  { image: '/images/card3.jpg', title: 'Thailand' },
];

function AnimatedCounter({ end }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <Typography variant="h4" fontWeight="bold">{count.toLocaleString()}</Typography>;
}

function Home() {
  const theme = useTheme();
  const [blogIndex, setBlogIndex] = useState(0);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundImage: 'url(/images/Topbanner.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          px: 2,
          mb: 0,
        }}
      >
        <Box>
          <Typography variant="h2" fontWeight={700} mb={7} gutterBottom>
            Discover the World with WanderTales
          </Typography>
          <Typography variant="h6" mb={4}>
            Find hidden gems. Share your stories. Inspire others.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" color="success" size="large" href="/login">
              Login / Signup
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, background: 'transparent', mt: '0cm' }}>
        <Grid container spacing={3} justifyContent="center">
          {stats.map((stat, i) => (
            <Grid item xs={12} sm={4} key={stat.label}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 3, background: '#fafbfc' }}>
                <Box sx={{ mb: 1 }}>{stat.icon}</Box>
                <AnimatedCounter end={stat.value} />
                <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary, fontWeight: 'bold' }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Top Destinations */}
      <Container sx={{ py: 6, background: 'transparent', borderRadius: 4, my: 4 }}>
        <Typography
          variant="h4"
          textAlign="center"
          gutterBottom
          sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 2 }}
        >
          Top Destinations
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {featuredCategories.map((cat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card
                sx={{
                  boxShadow: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={cat.image}
                  alt={cat.title}
                  sx={{
                    width: 200,
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mt: 2,
                  }}
                />
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={600}>
                    {cat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Trending Blogs */}
      <Box sx={{ py: 6, background: 'transparent' }}>
        <Typography
          variant="h4"
          textAlign="center"
          mb={2}
          sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
        >
          Trending Blogs
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 600, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <IconButton
              onClick={() => setBlogIndex((blogIndex - 1 + blogs.length) % blogs.length)}
              disabled={blogs.length <= 1}
              sx={{ mr: 1 }}
              aria-label="Previous Blog"
            >
              <ArrowBackIosNewIcon />
            </IconButton>
            <Box sx={{ position: 'relative', width: '100%', height: 300, mb: 2 }}>
                <img
                  src={blogs[blogIndex].image}
                  alt={blogs[blogIndex].title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  }}
                />
            </Box>
                
            <IconButton
              onClick={() => setBlogIndex((blogIndex + 1) % blogs.length)}
              disabled={blogs.length <= 1}
              sx={{ ml: 1 }}
              aria-label="Next Blog"
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
          <Typography variant="h5" fontWeight="bold" textAlign="center" mb={1}>
            {blogs[blogIndex].title}
          </Typography>
          <Typography variant="body1" textAlign="center" mb={2}>
            {blogs[blogIndex].description}
          </Typography>
        </Box>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: 6, background: 'transparent' }}>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography
            variant="h4"
            textAlign="center"
            mb={2}
            sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
          >
            What Our Users Say
          </Typography>
          <Box>
            {testimonials.map((t, i) => (
              <Paper
                key={t.name}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  background: '#fff',
                  borderLeft: `4px solid ${theme.palette.primary.light}`,
                  width: '100%',
                  mb: 3,
                }}
              >
                <Avatar
                  src={t.photo}
                  sx={{
                    width: 56,
                    height: 56,
                    mr: 2,
                    border: `2px solid ${theme.palette.primary.main}`,
                  }}
                />
                <Box>
                  <FormatQuoteIcon sx={{ color: theme.palette.primary.main, mb: -1, mr: 1 }} />
                  <Typography variant="body1" fontStyle="italic" sx={{ color: theme.palette.text.primary }}>
                    "{t.quote}"
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    - {t.name}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Home;
