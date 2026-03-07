import logo from './logo.svg';
import './App.css';
import ContextProvider from './Data/ContextProvider';
import StateData from './Data/StateData';
import { Navigate, Route, Routes, useRouteMatch } from 'react-router-dom';
import { getCookieValue } from './util/Commons'
import MainApp from './Components/Mainapp';
import SignIn from './Components/SignIn';
import ContentComponent from './Router/Content';
import Donvi from './Router/Donvi';
import Nguoidung from 'Router/Nguoidung';
import Maychu from 'Router/Maychu';



function App() {
  const RestrictedRoute = ({ token, children }) => {
    if (!token) {
      return <Navigate to="/signin" replace />;
    }

    return children;
  };
  const { intialState } = StateData();
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
          <Route path="home" element={<ContentComponent />} />
          <Route path="he-thong/don-vi" element={<Donvi />} />
          <Route path="he-thong/may-chu" element={<Maychu />} />
          <Route path="he-thong/nguoi-dung" element={<Nguoidung />} />
        </Route>
      </Routes>
    </ContextProvider>
  );
}

export default App;
