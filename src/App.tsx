import { useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import { MinusCircle, PlusCircle } from 'lucide-react';
import { ButtonGroup, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';

function App() {
  const API_URL = `http://localhost:3001/api/bbershadsky/character`;
  const saveCharacter = async (characterData: any) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      });

      if (!response.ok) {
        throw new Error('Failed to save character data');
      }

      console.log('Character saved successfully!');
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  const retrieveCharacter = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve character data');
      }

      const data = await response.json();
      console.log('Character retrieved:', data);
      return data;
    } catch (error) {
      console.error('Error retrieving character:', error);
      return null;
    }
  };

  const [skillPoints, setSkillPoints] = useState<Record<string, number>>(
    SKILL_LIST.reduce((acc, skill) => ({ ...acc, [skill.name]: 0 }), {})
  );

  const calculateModifier = (value: number): number => Math.floor((value - 10) / 2);

  const [attributes, setAttributes] = useState<Record<string, number>>(
    ATTRIBUTE_LIST.reduce((acc, attr) => ({ ...acc, [attr]: 10 }), {})
  );

  const totalSkillPointsAvailable =
    10 + 4 * calculateModifier(attributes['Intelligence']);

  const totalPointsSpent = Object.values(skillPoints).reduce((sum, val) => sum + val, 0);

  const handleSkillPointChange = (skillName: string, increment: boolean) => {
    setSkillPoints((prev) => {
      const newPoints = (prev[skillName] as number) + (increment ? 1 : -1);
      if (newPoints < 0 || totalPointsSpent + (increment ? 1 : -1) > totalSkillPointsAvailable) {
        return prev; // Prevent going below 0 or exceeding total points available
      }
      return { ...prev, [skillName]: newPoints };
    });
  };

  const MAX_ATTRIBUTE_TOTAL = 70;

  const handleAttributeChange = (attribute: string, increment: boolean) => {
    setAttributes((prev) => {
      const newTotal = Object.values(prev).reduce((sum, val) => sum + val, 0) + (increment ? 1 : -1);
      if (newTotal > MAX_ATTRIBUTE_TOTAL && increment) {
        return prev; // Prevent increment if it exceeds the maximum total
      }
      return {
        ...prev,
        [attribute]: Math.max(0, prev[attribute] + (increment ? 1 : -1)),
      };
    });
  };
  const [skillCheck, setSkillCheck] = useState({
    skill: '',
    dc: 0,
    rollResult: null as number | null,
    success: null as boolean | null,
  });

  const [selectedClass, setSelectedClass] = useState<string | null>(null);

    // Check if the character qualifies for a class
    const checkClassEligibility = (className: string): boolean => {
      const requirements = CLASS_LIST[className];
      return ATTRIBUTE_LIST.every((attr) => attributes[attr] >= requirements[attr]);
    };
  
  const handleSkillCheckChange = (field: string, value: string | number) => {
    setSkillCheck((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const rollSkillCheck = () => {
    const randomRoll = Math.floor(Math.random() * 20) + 1; // Random number between 1 and 20
    const skillModifier = calculateModifier(attributes[SKILL_LIST.find((s) => s.name === skillCheck.skill)?.attributeModifier || '']);
    const skillValue = (skillPoints[skillCheck.skill] || 0) + skillModifier;
    const success = skillValue + randomRoll >= skillCheck.dc;

    setSkillCheck((prev) => ({
      ...prev,
      rollResult: randomRoll,
      success,
    }));
  };


  return (
    <div className="App">
      <header className="App-header">
      <h4>(Boris Bershadsky | github: bbershadsky)</h4>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              saveCharacter({ attributes, skillPoints, selectedClass, skillCheck })
            }
          >
            Save Character
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{ marginLeft: 2 }}
            onClick={async () => {
              const data = await retrieveCharacter();
              if (data) {
                setAttributes(data.attributes || {});
                setSkillPoints(data.skillPoints || {});
                setSelectedClass(data.selectedClass || null);
                setSkillCheck(data.skillCheck || {});
              }
            }}
          >
            Load Character
          </Button>
        </Box>
        <Box>
          <Typography variant="h4">Skill Check</Typography>
          <Box display="flex" gap={2} sx={{ marginBottom: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Skill</InputLabel>
              <Select
                value={skillCheck.skill}
                onChange={(e) => handleSkillCheckChange('skill', e.target.value)}
              >
                {SKILL_LIST.map((skill) => (
                  <MenuItem key={skill.name} value={skill.name}>
                    {skill.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="DC"
              type="number"
              value={skillCheck.dc}
              onChange={(e) => handleSkillCheckChange('dc', parseInt(e.target.value, 10))}
              fullWidth
              sx={{ marginBottom: 2 }}
            />
            <Button variant="contained" onClick={rollSkillCheck}>
              Roll
            </Button>
            {skillCheck.rollResult !== null && (
              <Box sx={{ marginTop: 3 }}>
                <Typography variant="body1">Roll: {skillCheck.rollResult}</Typography>
                <Typography variant="body1">
                  {skillCheck.success ? 'Success!' : 'Failure'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

      </header>
      <section className="App-section">
        <Grid
          container
        >
          <Grid>
            <Typography variant="h4">Attributes</Typography>
            {ATTRIBUTE_LIST.map((attr) => (
              <Box
                key={attr}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                paddingRight={2}
                paddingLeft={2}
              >
                <Typography variant="h6">{attr}</Typography>
                <ButtonGroup>
                  <IconButton onClick={() => handleAttributeChange(attr, true)}>
                    <PlusCircle />
                  </IconButton>
                  <IconButton onClick={() => handleAttributeChange(attr, false)}>
                    <MinusCircle />
                  </IconButton>
                </ButtonGroup>
                <Typography variant="h6">{attributes[attr]}</Typography>
                <Typography variant="body1" sx={{ marginLeft: 2 }}>
                  Modifier: {calculateModifier(attributes[attr])}
                </Typography>
              </Box>
            ))}
          </Grid>
          <Grid
            size={{ sm: 4, md: 4, lg: 4 }}
            sx={{
              backgroundColor:  'grey' ,
            }}
          >
            <Typography variant="h4">Classes</Typography>
            <Box
              paddingRight={2}
              paddingLeft={2}
            >
            {Object.keys(CLASS_LIST).map((className) => (
              <Paper
                key={className}
                elevation={3}
                sx={{
                  padding: 2,
                  marginBottom: 2,
                  backgroundColor: checkClassEligibility(className) ? '#d4edda' : '#f8d7da',
                  color: checkClassEligibility(className) ? '#155724' : '#721c24',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedClass(className)}
              >
                <Typography variant="h6">{className}</Typography>
              </Paper>
            ))}
            {selectedClass && CLASS_LIST[selectedClass] && (
              <Box sx={{ marginTop: 3 }}>
                <Typography variant="h5">Minimum Requirements for {selectedClass}</Typography>
                {Object.entries(CLASS_LIST[selectedClass]).map(([attr, value]) => (
                  <Typography key={attr} variant="body1">
                    {attr}: {value}
                  </Typography>
                ))}
              </Box>
              )}
            </Box>
          </Grid>
          <Grid
            size={{ sm: 5, md: 5, lg: 5 }}
            sx={{
              backgroundColor: '#c9c9c9',
            }}
          >
            <Box
              paddingRight={2}
              paddingLeft={2}
            >
            <Typography variant="h4">Skills</Typography>
            <Typography variant="body1">
              Total skill points available: {totalSkillPointsAvailable - totalPointsSpent}
            </Typography>
            {SKILL_LIST.map((skill) => {
              const modifier = calculateModifier(attributes[skill.attributeModifier]);
              const totalSkillValue = skillPoints[skill.name] + modifier;

              return (
                <Box
                  key={skill.name}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6">
                    {skill.name} (Modifier: {skill.attributeModifier})
                  </Typography>
                  <ButtonGroup>
                    <IconButton onClick={() => handleSkillPointChange(skill.name, true)}>
                      <PlusCircle />
                    </IconButton>
                    <IconButton onClick={() => handleSkillPointChange(skill.name, false)}>
                      <MinusCircle />
                    </IconButton>
                  </ButtonGroup>
                  <Typography variant="body1">
                    Points: {skillPoints[skill.name]} | Total: {totalSkillValue}
                  </Typography>
                </Box>
              );
            })}
              </Box>
          </Grid>
          </Grid>
      </section>
    </div>
  );
}

export default App;
