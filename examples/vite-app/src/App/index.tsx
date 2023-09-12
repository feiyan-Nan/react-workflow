import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import Basic from '../examples/Basic';

interface IRoute {
  name: string;
  path: string;
  component: React.ComponentType;
}

const routes: IRoute[] = [
  {
    name: 'Basic',
    path: '/',
    component: Basic,
  }
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    const name = routes.find((route) => route.path === currentPath)?.name;
    document.title = `React Flow Examples${name ? ' - ' + name : ''}`;
    navigate(currentPath);
  }, [currentPath]);

  return (
    <header>
      <a className="logo" href="https://github.com/wbkd/react-flow">
        React Flow Dev
      </a>
      <select value={currentPath} onChange={(event) => setCurrentPath(event.target.value)}>
        {routes.map((route) => (
          <option value={route.path} key={route.path}>
            {route.name}
          </option>
        ))}
      </select>
    </header>
  );
};

export default () => (
  <BrowserRouter>
    <Header />
    <Routes>
      {routes.map((route) => (
        <Route path={route.path} key={route.path} element={<route.component />} />
      ))}
    </Routes>
  </BrowserRouter>
);
