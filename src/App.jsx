import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
function PrivateRoute({ children }){ const isAuth=localStorage.getItem('maye_auth')==='true'; const loc=useLocation(); return isAuth?children:<Navigate to='/login' state={{from:loc}} replace/> }
export default function App(){ return (<Routes><Route path='/' element={<Navigate to='/login' replace/>}/><Route path='/login' element={<Login/>}/><Route path='/home' element={<PrivateRoute><Home/></PrivateRoute>}/><Route path='*' element={<Navigate to='/login' replace/>}/></Routes>) }
