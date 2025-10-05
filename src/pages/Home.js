import {
  Box, Button, Typography, Grid, Card, CardMedia, CardContent, Avatar, Paper,
  useTheme, Container, IconButton
} from '@mui/material';

import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PeopleIcon from '@mui/icons-material/People';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';

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
  const [isDay, setIsDay] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsDay(hour >= 6 && hour < 18);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlogIndex(prev => (prev + 1) % blogs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Box sx={{
  minHeight: '100vh',
  width: '100%',
  backgroundImage: 'url(/images/Topbanner.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
}}>

      {/* Hero Section */}
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', px: 2 }}>
        <Box>
          <Typography variant="h2" fontWeight={700} mb={7}>Discover the World with WanderTales</Typography>
          <Typography variant="h6" mb={4}>
            <Typewriter
              words={['Find hidden gems.', 'Share your stories.', 'Inspire others.']}
              loop={true}
              cursor
              cursorStyle="|"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1500}
            />
          </Typography>
                    <Button variant="contained" color="success" size="large" href="/login">Login / Signup</Button>
        </Box>
      </Box>
      {/* Stats Section */}
      <Box sx={{ py: 6 }}>
        <Grid container spacing={3} justifyContent="center">
          {stats.map((stat) => (
            <Grid item xs={12} sm={4} key={stat.label}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                <motion.div animate={{ x: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  {stat.icon}
                </motion.div>
                <AnimatedCounter end={stat.value} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{stat.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Top Destinations */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontWeight: 'bold' }}>Top Destinations</Typography>
        <Grid container spacing={4} justifyContent="center">
          {featuredCategories.map((cat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card sx={{
                  boxShadow: 3,
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 4,
                  transition: 'transform 0.5s',
                  '&:hover': { transform: 'rotateY(10deg)' }
                }}>
                  <CardMedia component="img" image={cat.image} alt={cat.title} sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 2 }} />
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>{cat.title}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
                {/* Trending Blogs */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" textAlign="center" mb={2} sx={{ fontWeight: 'bold' }}>Trending Blogs</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 600, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <IconButton onClick={() => setBlogIndex((blogIndex - 1 + blogs.length) % blogs.length)}><ArrowBackIosNewIcon /></IconButton>
            <motion.div
              key={blogIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{ width: '100%', height: 300 }}
            >
              <img src={blogs[blogIndex].image} alt={blogs[blogIndex].title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} />
            </motion.div>
            <IconButton onClick={() => setBlogIndex((blogIndex + 1) % blogs.length)}><ArrowForwardIosIcon /></IconButton>
          </Box>
          <Typography variant="h5" fontWeight="bold" textAlign="center">{blogs[blogIndex].title}</Typography>
          <Typography variant="body1" textAlign="center">{blogs[blogIndex].description}</Typography>
        </Box>
      </Box>
      {/* Testimonials */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" textAlign="center" mb={2} sx={{ fontWeight: 'bold' }}>What Our Users Say</Typography>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          {testimonials.map((t) => (
            <Paper key={t.name} sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 3,
              background: 'linear-gradient(270deg, #f3ec78, #cecd91ff)',
              backgroundSize: '400% 400%',
              mb: 3
            }} style={{ animation: 'gradientShift 8s ease infinite' }}>
              <Avatar src={t.photo} sx={{ width: 56, height: 56, mr: 2 }} />
              <Box>
                <FormatQuoteIcon sx={{ mb: -1, mr: 1 }} />
                <Typography variant="body1" fontStyle="italic">
                  <Typewriter
                    words={[`"${t.quote}"`]}
                    loop={false}
                    cursor
                    cursorStyle="|"
                    typeSpeed={70}
                    deleteSpeed={50}
                    delaySpeed={2000}
                  />
                </Typography>
                <Typography variant="subtitle2">- {t.name}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
      {/* Gradient animation keyframes */}
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </Box>
  );
}

export default Home;