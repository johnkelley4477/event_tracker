/* Third Party */
import React, {useState,useEffect} from 'react';
import {FaSignInAlt} from 'react-icons/fa';
/* Components */
import firebase from './Firebase';

export default props => {
  const [email,setEmail] = useState('');
  const [company,setCompany] = useState('');
  const [admin,setAdmin] = useState(false);
  const [uid,setUid] = useState('');
  const [companyList,setCompanyList] = useState([]);
  const [message,setMessage] = useState(null);
  const [isEnabled,setEnabled] = useState(false);
  const completed = () => {
    if (email !== '' && company !== ''){
      const staff = firebase
        .database()
        .ref(`Staff/${company}`)
        .orderByChild('email')
        .equalTo(email);
      staff.on('value', snapshot => {
          if(snapshot.val() !== null){
            let s = Object.entries(snapshot.val());
            setUid(s[0][0])
            setMessage(`Hello ${s[0][1].firstName}`);
            setEnabled(true);
            setAdmin(s[0][1].admin ? true:false)
          }else{
            setMessage('Sorry we don\'t have this email on file');
            setEnabled(false);
            setAdmin(false);
          }
          staff.off();
        });
    }else{
      setEnabled(false);
    }
  }
  const submitHandler = e => {
    const staffObj = {
      uid: uid,
      email: email,
      companyId:company,
      admin: admin
    }
    props.staff(staffObj);
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
  },[])
  return(
    <div className='phone_width center'>
      {message && (
        <p>{message}</p>
      )}
      <form>
        <select id='company' name='company'  onChange={() => {
            const l = document.getElementById('company');
            setCompany(l.options[l.selectedIndex].value);
            completed();
          }}>
          <option value=''>Choose your Company</option>
          {companyList.map((co,i) => {
            return(
              <option key={i.toString()}value={co[1].coId}>{co[1].coName}</option>
            )
          })}
        </select>
        <input type='email' id='email' name='email' placeholder='Your Email' value={email} onChange={()=>{setEmail(document.getElementById('email').value)}} onKeyUp={() => {completed()}}/>
        <div className='icon_button mt5' disabled= {isEnabled ? '' : 'disabled'} onClick={e => {submitHandler(e);}}>
          <FaSignInAlt />
        </div>
      </form>
    </div>
  )
}
