import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import MyAppointments from './pages/MyAppointments';
import Appointment from './pages/Appointment';
import Navbar from './components/Navbar';
import Services from './pages/Services';
import Footer from './components/Footer';
import AppointmentProvider from './context/salonContext';

const App = () => {
  return (
    <AppointmentProvider>
    <div className="mx-2 sm:mx-[5%] md:mx-[7%] lg:mx-[8%] xl:mx-[20%]"> 
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/services' element={<Services/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/my-appointments' element={<MyAppointments/>}/>
        <Route path='/appointment' element={<Appointment/>}/>
        <Route path='/footer' element={<Footer/>}/>
      </Routes>
    </div>
    </AppointmentProvider>
  )
}

export default App;
