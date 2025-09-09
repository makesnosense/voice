import { Route, Routes } from 'react-router';
import LandingPage from './pages/LandingPage';
import RoomPage from './pages/room/RoomPage';
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />}></Route>
      <Route path="/:roomId" element={<RoomPage />}></Route>
      {/* <Route path="/tracking/:orderId/:productId" element={<TrackingPage cart={cart} />}></Route> */}
      {/* <Route path="*" element={<NotFound cart={cart} />}></Route> */}
    </Routes>
  )
}