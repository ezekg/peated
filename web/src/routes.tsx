import type { RouteObject } from "react-router-dom";

import Root from "./routes/root";
import ErrorPage from "./error-page";
import Checkin, { loader as checkinLoader } from "./routes/checkin";
import Activity, { loader as activityLoader } from "./routes/activity";
import Search from "./routes/search";
import Login from "./routes/login";
import Profile from "./routes/profile";
import AddBottle from "./routes/addBottle";
import Favorites from "./routes/favorites";

export default [
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Activity />, loader: activityLoader },
      {
        path: "addBottle",
        element: <AddBottle />,
      },
      {
        path: "b/:bottleId/checkin",
        element: <Checkin />,
        loader: checkinLoader,
      },
      {
        path: "search",
        element: <Search />,
      },
      {
        path: "favorites",
        element: <Favorites />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
] as RouteObject[];