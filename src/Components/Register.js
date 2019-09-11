/* Third party */
import React, {useState, useEffect} from 'react';
import {FaCaretDown} from 'react-icons/fa';
import {navigate} from '@reach/router';
/* Components */
import firebase from './Firebase';

export default props => {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [company,setCompany] = useState('');
  const [error,setError] = useState(null);
  const [isEnabled, setEnabled] = useState(false);
  const [companyList,setCompanyList] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [verified, setVerified] = useState('');

  const completed = () => {
    if (
      password !== ''
      && email !== ''
      && verified !== ''
      && displayName !== ''
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
    const staff = firebase
      .database()
      .ref(`/Staff/${company}`)
      .orderByChild('email')
      .equalTo(email);
    staff.on('value', snapshot => {
      if(snapshot.val() !== null){
        firebase
          .auth()
          .createUserWithEmailAndPassword(email,password)
          .then(() => {
            firebase
              .auth()
              .signInWithEmailAndPassword(email,password);
            props.registerUser(company);
            navigate('/');
          })
          .catch(error => {
            if (error.message !== null ){
              setError(error.message);
            }
          });
        }else{
          setError(`The email ${email} is not assigned to your selected company. Please tell your Administrator`);
          setEmail('');
          setEnabled(false);
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
    <form className='frame mt10 phone_width center' onSubmit={submitHandler} onKeyUp={completed}>
			<h2>Register</h2>
			{error !== null && (
				<div className='error'>{error}</div>
			)}
      <div className="select_contaner">
        <select id='company' name='company' className='w104p' onChange={() => {
            const l = document.getElementById('company');
            setCompany(l.options[l.selectedIndex].value);
          }} onKeyUp={()=>{completed()}}>
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
        <div className='dropdownCaret' onClick={() => {
          const select = document.getElementById('company');
          select.size = companyList.length;
        }}>
          <FaCaretDown/>
        </div>
      </div>
			<input type='text' name='displayName' id='displayName' placeholder='Your Name' value={displayName} onChange={()=>{setDisplayName(document.getElementById('displayName').value);}} onKeyUp={()=>{completed()}}/>
    	<input type='email' name='email' id='email' placeholder='Email' value={email} onChange={()=>{setEmail(document.getElementById('email').value)}} onKeyUp={()=>{completed()}} className='mt10'/>
    	<input type='password' name='password' id='password' placeholder='Password' value={password} onChange={()=>{setPassword(document.getElementById('password').value)}} onKeyUp={()=>{completed()}} className='mt10'/>
    	<input type='password' name='verified' id='verified' placeholder='Password again' value={verified} onChange={()=>{setVerified(document.getElementById('verified').value)}} onKeyUp={()=>{completed()}} className='mt10'/>
    	<input type='submit' className='mt10' disabled= {isEnabled ? '' : 'disabled'} />
    </form>
  )
}
