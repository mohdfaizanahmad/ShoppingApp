import Dashboard from "./Component/Admin/Dashboard/Dashboard";
import "./App.css";
import Navbar from "./Component/Navbar";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import SignUp from "./Component/User/SignUp";
import LogIn from "./Component/User/LogIn";
import AdminLogIn from "./Component/LogIn/AdminLogIn";
import Test1 from "./Component/Admin/Dashboard/Test1";
import Test2 from "./Component/Admin/Dashboard/Test2";
import Router from "./routes";

function App() {
  return (
    <>
      <Router />
    </>
  );
}

export default App;
