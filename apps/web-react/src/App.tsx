import { NavLink, Outlet } from "react-router-dom";

import BuildInfo from "./components/BuildInfo";

/**
 * Application layout: header with navigation + routed content + footer.
 * Port of apps/web/src/App.vue.
 */
function App() {
  return (
    <div className="content">
      <header>
        <div className="wrapper">
          <nav>
            <img className="logo" src="./food_recipe_calculator_icon.png" width={64} alt="" />
            <NavLink to="/">Калькулятор</NavLink>
            <NavLink to="/favorite">Избранное</NavLink>
            {/* <NavLink to="/helpers">Утилиты</NavLink> */}
            <NavLink to="/about">О проекте</NavLink>
          </nav>
        </div>
      </header>

      <Outlet />
      <footer>
        <BuildInfo />
      </footer>
    </div>
  );
}

export default App;
