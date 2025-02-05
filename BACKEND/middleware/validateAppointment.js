export const validateAppointment = (req, res, next) => {
    const { date, timeSlot } = req.body;
    if (!date || !timeSlot) {
      return res.status(400).json({ error: "Date and timeSlot are required" });
    }
  
    const dateObject = new Date(date);
    if (isNaN(dateObject)) {
      return res.status(400).json({ error: "Invalid date format" });
    }
  
    next();
  };
  