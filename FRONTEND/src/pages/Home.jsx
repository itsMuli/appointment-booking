import Header from "../components/Header"
import Appointment from "./Appointment"
import Services from "./Services"
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div id="home-section">
      <Header/>
      <Services/>
      <Appointment/>
      <Footer/>
    </div>
  )
}

export default Home