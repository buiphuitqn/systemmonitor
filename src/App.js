import logo from './logo.svg';
import './App.css';
import ContextProvider from './Data/ContextProvider';
import useStateData from './Data/StateData';
import { Navigate, Route, Routes, useRouteMatch } from 'react-router-dom';
import { getCookieValue } from './util/Commons'
import MainApp from './Components/Mainapp';
import SignIn from './Components/SignIn';
import ContentComponent from './Router/Content';
import Donvi from './Router/Donvi';
import Nguoidung from 'Router/Nguoidung';
import Maychu from 'Router/Maychu';
import Vaitro from 'Router/Vaitro';
import QuanlyMenu from 'Router/QuanlyMenu';
import bgImage from './assets/images/BG.jpg';



const RestrictedRoute = ({ token, children }) => {
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

const Homepage = () => {
  return (
    <div>
      <img src={bgImage} width={'100%'} alt="background"></img>
    </div>
  )
}

function App() {
  const { intialState } = useStateData();
  const info = getCookieValue('tokenInfo');
  return (
    <ContextProvider value={intialState}>
      <Routes>
        <Route path='/signin' element={<SignIn />} />
        <Route
          path="/*"
          element={
            <RestrictedRoute token={info}>
              <MainApp />
            </RestrictedRoute>
          }
        >
          <Route path='home' element={<Homepage />} />
          <Route path="system" element={<ContentComponent />} />
          <Route path="he-thong/don-vi" element={<Donvi />} />
          <Route path="he-thong/may-chu" element={<Maychu />} />
          <Route path="he-thong/nguoi-dung" element={<Nguoidung />} />
          <Route path="he-thong/vai-tro" element={<Vaitro />} />
          <Route path="he-thong/chuc-nang" element={<QuanlyMenu />} />
        </Route>
      </Routes>
    </ContextProvider>
  );
}

export default App;
