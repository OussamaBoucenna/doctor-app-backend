// Utility function to calculate age based on birthDate
const calculateAge = (birthDate) => {
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };
  
  module.exports = calculateAge;
  