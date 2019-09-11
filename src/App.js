/* Third party */
import React, {useState,useEffect} from 'react';
import {Router, navigate, Link} from '@reach/router';
import {FaSignOutAlt, FaSignInAlt, FaUsers, FaBuilding, FaCalendar} from 'react-icons/fa';
// import Cookies from 'universal-cookie';
/* Components */
import Login from './Components/Login';
import Register from './Components/Register';
import RegisterCompany from './Components/RegisterCompany';
import Staff from './Components/Staff';
import Event from './Components/Events';
import Venue from './Components/Venue';
import firebase from './Components/Firebase';
/* client files */
import './client/css/general.css';

export default () => {
  const [userID,setUserID] = useState(null);
  const [admin,setAdmin] = useState(false);
  const [userEmail,setUserEmail] = useState(null);
  const [userCompany,setUserCompany] = useState(null);
  const [path, setPath] = useState('/');
  const registerUser = (displayName) => {
    firebase.auth()
      .onAuthStateChanged(
        FBUser => {
          FBUser.updateProfile({
            displayName: displayName
        }).then(() =>{
          setUserID(FBUser.uid);
          setUserEmail(FBUser.email);
          const coData = {
            displayName:displayName
          }
          const company = firebase
            .database()
            .ref('Companies');
          company.push(coData);
        })
      });
  }
  useEffect(() =>{
    setPath(window.location.pathname);
    firebase
    .auth()
    .onAuthStateChanged(FBUser => {
      if(FBUser){
        setUserID(FBUser.uid);
        setUserEmail(FBUser.email);
        setUserCompany(FBUser.displayName);
        const staff = firebase
          .database()
          .ref(`Staff/${userCompany}`)
          .orderByChild('email')
          .equalTo(userEmail);
        staff.on('value', snapshot => {
          if(snapshot.val() !== null){
            const staffArray = Object.entries(snapshot.val());
            setAdmin(staffArray[0][1].admin);
          }
        });
      }else if (window.location.pathname !== '/register' && window.location.pathname !== '/register/company'){
        navigate('/login');
      }
    });
  },[userCompany,userEmail]);
  const logoutUser = e =>{
		e.preventDefault();
    setUserID(null);
    setUserEmail(null);
    setAdmin(false);
		firebase.auth().signOut()
		.then(() => {
			navigate('/login');
		})
	}
  const logState = () => {
    if(userID !== null){
      return <FaSignOutAlt onClick={logoutUser}/>;
    }else{
      return <FaSignInAlt onClick={logoutUser}/>
    }
  }

  return (
    <div className="App">
      <header className="App-header flex">
        <h1 className='w75'>Event Scheduler</h1>
        <div className='w25 font_white loginOut'>
          {logState()}
        </div>
      </header>
      {admin && (
        <div className='admin_menu flex'>
          <div>
            <Link className={`font_white loginOut mr15 ${path === '/' ? 'isDisabled':''}`} to='/' onClick={() => {setPath('/')}}>
              <FaCalendar />
            </Link>
            <Link className={`font_white loginOut mr15 ${path === '/staff' ? 'isDisabled':''}`} to='/staff' onClick={() => {setPath('/staff')}}>
              <FaUsers />
            </Link>
            <Link className={`font_white loginOut ${path === '/venue' ? 'isDisabled':''}`} to='/venue' onClick={() => {setPath('/venue')}}>
              <FaBuilding />
            </Link>
          </div>
        </div>
      )}
      <Router>
        <Login path='/login' setAdmin={setAdmin} setUserCompany={setUserCompany}/>
        <Register path='/register' registerUser={registerUser}/>
        <RegisterCompany path='/register/company' registerUser={registerUser}/>
        {admin && (
          <Staff path='/staff' admin={admin} user={userID} company={userCompany} email={userEmail}/>
        )}
        {admin && (
          <Venue path='/venue' admin={admin} user={userID} company={userCompany} email={userEmail}/>
        )}
        <Event path='/' user={userID} company={userCompany} email={userEmail}/>
      </Router>
    </div>
  );
}
