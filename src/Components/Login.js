/* Third party */
import React, {useState, useEffect} from 'react';
import {navigate} from '@reach/router';
/* Components */
import firebase from './Firebase';

export default props => {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [companyList,setCompanyList] = useState([]);
  const [company,setCompany] = useState('');
  const [error,setError] = useState(null);
  const submitHandler = e => {
    e.preventDefault();
    firebase
      .auth()
      .signInWithEmailAndPassword(email,password)
      .then(() =>{
        const staff = firebase
          .database()
          .ref(`Staff/${company}`)
          .orderByChild('email')
          .equalTo(email);
        staff.on('value',snapshot => {
          const staffArray = Object.entries(snapshot.val());
          if(staffArray[0][1].admin){
            props.setAdmin(true);
          }else{
            props.setAdmin(false);
          }
          props.setUserCompany(company);
          staff.off();
        })
        navigate('/');
      })
      .catch(error => {
        if (error.message !== null) {
          setError(error.message)
        }
      });

  }
  useEffect(() => {
    const companies = firebase
      .database()
      .ref('Companies')
      .orderByChild('coName');
      companies.on('value', snapshot => {
        setCompanyList(Object.entries(snapshot.val()));
        companies.off();
      });
    },[]);
  return (
    <form className='phone_width center' onSubmit={submitHandler}>
      <h1>Login</h1>
      {error !== null && (
        <div className='error'>{error}</div>
      )}
      <div className="select_contaner">
        <select id='company' className='w104p' name='company'  onChange={() => {
            const l = document.getElementById('company');
            setCompany(l.options[l.selectedIndex].value);
          }}>
          <option value=''>Choose your Company</option>
          {companyList.map((co,i) => {
            return(
              <option key={i.toString()}value={co[1].coId} onClick={() => {
                const select = document.getElementById('company');
                select.size = 1;
              }}>{co[1].coName}</option>
            )
          })}
        </select>
      </div>
      <input type='email' name='email' id='email' placeholder='Email' onChange={() => {setEmail(document.getElementById('email').value)}} />
      <input type='password' name='password' id='password' placeholder='Password' onChange={() => {setPassword(document.getElementById('password').value)}} />
      <input type='submit' value='Login' />
    </form>
  )
}
