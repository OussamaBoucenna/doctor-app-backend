const dayMap = {
    dimanche: 1,
    lundi: 2,
    mardi: 3,
    mercredi: 4,
    jeudi: 5,
    vendredi: 6,
    samedi: 0
  };
  
  /**
   * Get all dates in a month that match a specific French weekday name.
   * 
   * @param {string} frenchDayName - Day of week in French (e.g., "lundi")
   * @param {number} year - Full year (e.g., 2025)
   * @param {number} month - Month number (1 = January, 12 = December)
   * @returns {string[]} Array of matching dates in YYYY-MM-DD format
   */
  function getMatchingDates(frenchDayName, year, month) {
    const targetDayIndex = dayMap[frenchDayName.toLowerCase()];
    if (targetDayIndex === undefined) {
      throw new Error("Invalid French day name: " + frenchDayName);
    }
  
    const daysInMonth = new Date(year, month, 0).getDate();
    const dates = [];
  
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      if (date.getDay() === targetDayIndex) {
        const isoDate = date.toISOString().split("T")[0];
        dates.push(isoDate);
      }
    }
  
    return dates;
  }
  
  module.exports = getMatchingDates;
  

  