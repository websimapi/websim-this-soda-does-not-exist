// Utility functions for the soda generator app

// Format date to a readable string
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Generate a random flavor suggestion
export function getRandomFlavorSuggestion() {
  const flavors = [
    "tangy mango-lime",
    "sweet vanilla-berry",
    "spicy cinnamon cola",
    "creamy butterscotch",
    "zesty lemon-lavender",
    "tropical coconut-pineapple",
    "refreshing cucumber-mint",
    "rich chocolate-orange",
    "tart green apple",
    "exotic dragon fruit-passionfruit"
  ];
  
  return flavors[Math.floor(Math.random() * flavors.length)];
}

// Generate a random occasion suggestion
export function getRandomOccasionSuggestion() {
  const occasions = [
    "summer beach parties",
    "late night coding sessions",
    "outdoor adventures",
    "movie nights",
    "winter celebrations",
    "gaming marathons",
    "creative brainstorming",
    "morning wake-up routines",
    "afternoon pick-me-ups",
    "relaxing after a long day"
  ];
  
  return occasions[Math.floor(Math.random() * occasions.length)];
}

// Share soda on social media (placeholder function)
export function shareSoda(soda) {
  // This would typically integrate with a social media sharing API
  console.log(`Sharing soda: ${soda.name}`);
  
  const shareText = `Check out this amazing fictional soda I created: ${soda.name} - ${soda.description.substring(0, 100)}...`;
  
  // Return shareText that could be used in a copy-to-clipboard function
  return shareText;
}

// Validate soda input fields
export function validateSodaInput(name, flavor, occasion) {
  const errors = {};
  
  if (!name || name.trim() === '') {
    errors.name = 'Soda name is required';
  }
  
  if (!flavor || flavor.trim() === '') {
    errors.flavor = 'Flavor description is required';
  }
  
  if (!occasion || occasion.trim() === '') {
    errors.occasion = 'Occasion is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

