// src/pages/StudentProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, TextField, Button, CircularProgress, Alert, Paper, Chip, Grid } from '@mui/material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function StudentProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    major: '',
    degreeProgram: '',
    graduationYear: '',
    bio: '',
    skills: [],
    interests: [],
    resumeUrl: '',
    linkedinProfileUrl: '',
    gpa: '',
    profilePictureUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Initialize as null
  const [success, setSuccess] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (user?.role !== 'STUDENT') {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get('/students/profile');
        const fetchedProfile = response.data;
        setProfile({
          ...fetchedProfile,
          skills: fetchedProfile.skills ? fetchedProfile.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
          interests: fetchedProfile.interests ? fetchedProfile.interests.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
        });
      } catch (err) {
        console.error('Error fetching student profile:', err);
        // Set error state, assuming the error has a message or is a general string
        setError(err.response?.data?.message || 'Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillAdd = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleSkillDelete = (skillToDelete) => {
    setProfile(prev => ({ ...prev, skills: profile.skills.filter(s => s !== skillToDelete) }));
  };

  const handleInterestAdd = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile(prev => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
      setNewInterest('');
    }
  };

  const handleInterestDelete = (interestToDelete) => {
    setProfile(prev => ({ ...prev, interests: profile.interests.filter(i => i !== interestToDelete) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const dataToSend = {
        ...profile,
        skills: profile.skills.join(','),
        interests: profile.interests.join(','),
      };
      await api.put('/students/profile', dataToSend);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating student profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please check your input.');
    }
  };

  // --- FIX START: Corrected JSX for loading and error states ---
  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading profile...</Typography>
      </Container>
    );
  }

  // If there's an error and profile data hasn't loaded (e.g., initial fetch failed)
  // And to avoid the error on line 107 `error && !profile.firstName` was intended for initial load error
  // If profile is null or undefined, an alert
  if (error && (!profile || !profile.firstName)) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  // --- FIX END ---


  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
          Your Student Profile
        </Typography>
        {/* Display success/error messages within the main content if already loaded */}
        {error && profile && profile.firstName && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="First Name" name="firstName" value={profile.firstName} onChange={handleChange} variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Last Name" name="lastName" value={profile.lastName} onChange={handleChange} variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Major" name="major" value={profile.major} onChange={handleChange} variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Degree Program" name="degreeProgram" value={profile.degreeProgram} onChange={handleChange} variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Graduation Year" name="graduationYear" type="number" value={profile.graduationYear || ''} onChange={handleChange} variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="GPA" name="gpa" type="number" inputProps={{ step: "0.01" }} value={profile.gpa || ''} onChange={handleChange} variant="outlined" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Bio" name="bio" value={profile.bio} onChange={handleChange} multiline rows={4} variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Add Skill (e.g., React, Java)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSkillAdd(); } }}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <Button onClick={handleSkillAdd} disabled={!newSkill.trim()}>Add</Button>
                  ),
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.skills.map((skill, index) => (
                  <Chip key={index} label={skill} onDelete={() => handleSkillDelete(skill)} color="primary" variant="outlined" />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Add Interest (e.g., AI, Fintech)"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleInterestAdd(); } }}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <Button onClick={handleInterestAdd} disabled={!newInterest.trim()}>Add</Button>
                  ),
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.interests.map((interest, index) => (
                  <Chip key={index} label={interest} onDelete={() => handleInterestDelete(interest)} color="secondary" variant="outlined" />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Resume URL" name="resumeUrl" value={profile.resumeUrl} onChange={handleChange} variant="outlined" helperText="Link to your online resume (e.g., Google Drive, Dropbox)" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="LinkedIn Profile URL" name="linkedinProfileUrl" value={profile.linkedinProfileUrl} onChange={handleChange} variant="outlined" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Profile Picture URL" name="profilePictureUrl" value={profile.profilePictureUrl} onChange={handleChange} variant="outlined" helperText="Link to your profile image" />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" size="large" sx={{ mt: 4, py: 1.5, px: 5, borderRadius: 1 }}>
            Save Profile
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default StudentProfilePage;