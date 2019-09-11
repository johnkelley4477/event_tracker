/* Third party */
import React, {useState} from 'react';
import {navigate} from '@reach/router';
/* Components */
import firebase from './Firebase';
/* Helpers */
import randomString from '../Helpers/randomString';

export default props => {
  const [email,setEmail] = useState('');
  const [phone,setPhone] = useState('');
  const [password,setPassword] = useState('');
  const [company,setCompany] = useState('');
  const [error,setError] = useState(null);
  const [isEnabled, setEnabled] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [verified, setVerified] = useState('');

  const completed = () => {
    if (
      password !== ''
      && email !== ''
      && phone !== ''
      && verified !== ''
      && firstName !== ''
      && lastName !== ''
      && company !== ''
    ) {
      if(match()){
        setEnabled(true);
      }else{
        setEnabled(false);
      }
    }else{
      setEnabled(false);
    }
  }
  const match = () => {
    if (password === verified) {
      setError(null);
      return true;
    }else{
      setError('Your passwords don\'t match');
      return false;
    }
  }
  const submitHandler = e => {
    e.preventDefault();
    const co = {
      coId: randomString(28),
      coName: document.getElementById('company').value
    };

    firebase
    .auth()
    .createUserWithEmailAndPassword(email,password) //Create a new User account
    .then(() => {
      firebase
        .auth()
        .signInWithEmailAndPassword(email,password) //Log in with the new credentals
        .then(
          firebase
            .database()
            .ref('/Companies')
            .push(co) //Push the new Company
            .then(
              firebase
          			.database()
          			.ref(`Staff/${co.coId}`)
                .push({ //Push new staff
            			firstName: document.getElementById('firstName').value,
            			lastName: document.getElementById('lastName').value,
            			email: document.getElementById('email').value,
            			phone: document.getElementById('phone').value,
            			role: 'Owner',
                  admin: true,
                  companyId: co.coId
            		})
                .then(
                  navigate('/login')
                )
            )
        )
      })
      .catch(error => {
          if (error.message !== null ){
            setError(error.message);
          }
        })

    // const company = firebase
    //   .database()
    //   .ref('/Companies');
    // company.push(co)
    //   .then(
    //     firebase
    // 			.database()
    // 			.ref(`Staff/${co.coId}`)
    //       .update({
    //   			firstName: document.getElementById('firstName').value,
    //   			lastName: document.getElementById('lastName').value,
    //   			email: document.getElementById('email').value,
    //   			phone: document.getElementById('phone').value,
    //   			role: 'Owner',
    //         admin: true,
    //         companyId: co.coId
    //   		})
    //       .then(
    //         firebase
    //         .auth()
    //         .createUserWithEmailAndPassword(email,password)
    //         .then(() => {
    //           firebase
    //             .auth()
    //             .signInWithEmailAndPassword(email,password);
    //           navigate('/');
    //         })
    //         .catch(error => {
    //           if (error.message !== null ){
    //             setError(error.message);
    //           }
    //         })
    //       )
    //   )
  }
  return (
    <form className='frame mt10 phone_width center' onSubmit={submitHandler} onKeyUp={completed}>
			<h2>Register Your Company</h2>
			{error !== null && (
				<div className='error'>{error}</div>
			)}
      <input type='text' id='company' name='company' placeholder='Your company name' onChange={() => {setCompany(document.getElementById('company').value)}} onKeyUp={()=>{completed()}} />
			<input type='text' name='firstName' id='firstName' placeholder='First Name' value={firstName} onChange={()=>{setFirstName(document.getElementById('firstName').value);}} onKeyUp={()=>{completed()}}/>
      <input type='text' name='lastName' id='lastName' placeholder='Last Name' value={lastName} onChange={()=>{setLastName(document.getElementById('lastName').value);}} onKeyUp={()=>{completed()}}/>
    	<input type='email' name='email' id='email' placeholder='Email' value={email} onChange={()=>{setEmail(document.getElementById('email').value)}} onKeyUp={()=>{completed()}} className='mt10'/>
      <input type='phone' name='phone' id='phone' placeholder='Phone' value={phone} onChange={()=>{setPhone(document.getElementById('phone').value)}} onKeyUp={()=>{completed()}} className='mt10'/>
    	<input type='password' name='password' id='password' placeholder='Password' value={password} onChange={()=>{setPassword(document.getElementById('password').value)}} onKeyUp={()=>{completed()}} className='mt10'/>
    	<input type='password' name='verified' id='verified' placeholder='Password again' value={verified} onChange={()=>{setVerified(document.getElementById('verified').value)}} onKeyUp={()=>{completed()}} className='mt10'/>
    	<input type='submit' className='mt10' disabled= {isEnabled ? '' : 'disabled'} />
    </form>
  )
}
