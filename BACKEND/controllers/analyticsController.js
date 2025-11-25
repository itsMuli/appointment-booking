import Appointment from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import artistModel from '../models/artistModel.js';
import Service from '../models/serviceModel.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Get all appointments
    const allAppointments = await Appointment.find();
    const thisMonthAppointments = await Appointment.find({
      createdAt: { $gte: startOfMonth }
    });
    const lastMonthAppointments = await Appointment.find({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // Get today's appointments
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    const todayAppointments = await Appointment.find({
      date: { $gte: todayStart, $lte: todayEnd }
    });

    // Calculate revenue
    const totalRevenue = allAppointments
      .filter(apt => apt.status === 'Confirmed')
      .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

    const thisMonthRevenue = thisMonthAppointments
      .filter(apt => apt.status === 'Confirmed')
      .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

    const lastMonthRevenue = lastMonthAppointments
      .filter(apt => apt.status === 'Confirmed')
      .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

    // Calculate growth rate
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    // Get user and artist counts
    const totalUsers = await userModel.countDocuments();
    const totalArtists = await artistModel.countDocuments();

    // Status counts
    const pendingAppointments = allAppointments.filter(apt => apt.status === 'Pending').length;
    const confirmedAppointments = allAppointments.filter(apt => apt.status === 'Confirmed').length;
    const cancelledAppointments = allAppointments.filter(apt => apt.status === 'Cancelled').length;

    // Average booking value
    const averageBookingValue = confirmedAppointments > 0 
      ? (totalRevenue / confirmedAppointments).toFixed(2)
      : 0;

    // Cancellation rate
    const cancellationRate = allAppointments.length > 0
      ? ((cancelledAppointments / allAppointments.length) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        totalAppointments: allAppointments.length,
        totalUsers,
        totalArtists,
        totalRevenue,
        pendingAppointments,
        confirmedAppointments,
        cancelledAppointments,
        todayAppointments: todayAppointments.length,
        monthlyRevenue: thisMonthRevenue,
        revenueGrowth: parseFloat(revenueGrowth),
        averageBookingValue: parseFloat(averageBookingValue),
        cancellationRate: parseFloat(cancellationRate)
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get revenue data for charts
export const getRevenueData = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const appointments = await Appointment.find({
      date: { $gte: startDate, $lte: endDate },
      status: 'Confirmed'
    }).sort({ date: 1 });

    // Group by date
    const revenueByDate = {};
    appointments.forEach(apt => {
      const dateKey = apt.date.toISOString().split('T')[0];
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = 0;
      }
      revenueByDate[dateKey] += apt.service?.price || 0;
    });

    // Fill in missing dates with 0
    const revenue = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      revenue.push({
        date: dateKey,
        amount: revenueByDate[dateKey] || 0
      });
    }

    res.json({
      success: true,
      revenue
    });
  } catch (error) {
    console.error('Revenue data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue data'
    });
  }
};

// Get appointment trends
export const getAppointmentTrends = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const appointments = await Appointment.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Group by date and status
    const trendsByDate = {};
    appointments.forEach(apt => {
      const dateKey = apt.date.toISOString().split('T')[0];
      if (!trendsByDate[dateKey]) {
        trendsByDate[dateKey] = {
          appointments: 0,
          confirmed: 0,
          cancelled: 0,
          pending: 0
        };
      }
      trendsByDate[dateKey].appointments++;
      trendsByDate[dateKey][apt.status.toLowerCase()]++;
    });

    // Fill in missing dates
    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      trends.push({
        date: dateKey,
        appointments: trendsByDate[dateKey]?.appointments || 0,
        confirmed: trendsByDate[dateKey]?.confirmed || 0,
        cancelled: trendsByDate[dateKey]?.cancelled || 0,
        pending: trendsByDate[dateKey]?.pending || 0
      });
    }

    res.json({
      success: true,
      trends
    });
  } catch (error) {
    console.error('Appointment trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment trends'
    });
  }
};

// Get popular services
export const getPopularServices = async (req, res) => {
  try {
    const appointments = await Appointment.find({ status: 'Confirmed' });
    
    // Count bookings by service
    const serviceStats = {};
    appointments.forEach(apt => {
      const serviceName = apt.service?.name;
      if (serviceName) {
        if (!serviceStats[serviceName]) {
          serviceStats[serviceName] = {
            name: serviceName,
            bookings: 0,
            revenue: 0
          };
        }
        serviceStats[serviceName].bookings++;
        serviceStats[serviceName].revenue += apt.service?.price || 0;
      }
    });

    // Convert to array and sort by bookings
    const services = Object.values(serviceStats)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10); // Top 10 services

    res.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Popular services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular services'
    });
  }
};

// Get artist performance
export const getArtistPerformance = async (req, res) => {
  try {
    const appointments = await Appointment.find({ status: 'Confirmed' });
    
    // Group by artist
    const artistStats = {};
    appointments.forEach(apt => {
      const artistName = apt.artist?.name;
      if (artistName) {
        if (!artistStats[artistName]) {
          artistStats[artistName] = {
            name: artistName,
            appointments: 0,
            revenue: 0
          };
        }
        artistStats[artistName].appointments++;
        artistStats[artistName].revenue += apt.service?.price || 0;
      }
    });

    // Convert to array and sort by revenue
    const artists = Object.values(artistStats)
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      success: true,
      artists
    });
  } catch (error) {
    console.error('Artist performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artist performance'
    });
  }
};