import logo from './logo.svg';
import './App.css';
import ContextProvider from './Data/ContextProvider';
import StateData from './Data/StateData';
import { Navigate, Route, Routes, useRouteMatch } from 'react-router-dom';
import { getCookieValue } from './util/Commons'
import MainApp from './Components/Mainapp';
import SignIn from './Components/SignIn';



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
            <RestrictedRoute token={info?.token}>
              <MainApp />
            </RestrictedRoute>
          }
        />
      </Routes>
    </ContextProvider>
  );
}

export default App;
