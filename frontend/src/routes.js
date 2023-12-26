import { Navigate, useRoutes } from "react-router-dom";
// layouts
import Test1 from "./Component/Admin/Dashboard/Test1";
import Dashboard from "./Component/Admin/Dashboard/Dashboard";

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: "/dashboard",
      element: <Dashboard />,
      children: [
        { element: <Navigate to="/dashboard" />, index: true },
        { path: "test1", element: <Test1 /> },
      ],
    },
  ]);

  return routes;
}
