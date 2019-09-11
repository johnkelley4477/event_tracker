/* Third party */
import React, {useState} from 'react';
import {FaSave,FaWindowClose, FaCheck} from 'react-icons/fa';
/* Components */
import firebase from './Firebase';

export default props => {
  const [admin,setAdmin] = useState(false);
  const [message, setMessage] = useState(null);
  let messageStyle = {
    color: '#00f',
    background: '#cef',
    padding: '10px',
    border: 'solid 2px #8af',
    borderRadius: '10px',
    textAlign: 'center'
  }
  const submitHandler = e => {
    e.preventDefault();
		const staff = {
			firstName: document.getElementById('firstName').value,
			lastName: document.getElementById('lastName').value,
			email: document.getElementById('email').value,
			phone: document.getElementById('phone').value,
			role: document.getElementById('role').value,
      admin: document.getElementById('admin').checked,
      companyId: props.user
		}
    let refPath = `Staff/${props.user}`;
    const staffId = document.getElementById('staffId').value;
    if(staffId !== '~'){
      refPath += `/${staffId}`
    }
		const ref = firebase
			.database()
			.ref(refPath);
    if(staffId !== '~'){
      ref.update(staff)
      .then(() => {
          document.getElementById('panelEdit').style.display = 'none'
        }
      )
      .catch(e => {
        setMessage(`There was an error: ${e}`);
      });
    }else{
      ref.push(staff)
      .then(() => {
        firebase
          .auth()
          .createUserWithEmailAndPassword(document.getElementById('email').value,'password')
          .then(() => {
              document.getElementById('panelEdit').style.display = 'none'
            }
          )
          .catch(e => {
            setMessage(`There was an error: ${e}`);
          })
      })
      .catch(e => {
        setMessage(`There was an error: ${e}`);
      });
    }
  }
  return (
    <div id='newStaff' className='modal'>
      {message !== null && (
        <p className='message' style={messageStyle}>{message}</p>
      )}
      <form onSubmit={submitHandler} className='phone_width modal-content'>
        <div className='header flex'>
          <h2 className='w75'>{`${props.userId !== ''? 'Edit': 'New'} Staff Member`}</h2>
          <span className="close w25" onClick={() => {document.getElementById(`panelEdit${props.userId}`).style.display = 'none';}} ><FaWindowClose /></span>
        </div>
        <input type='text' id='staffId' name='staffId' className='hidden'/>
        <input type='text' id='firstName' name='firstName' placeholder='First Name'/>
        <input type='text' id='lastName' name='lastName' placeholder='Last Name'/>
        <input type='text' id='email' name='email' placeholder='Email'/>
        <input type='text' id='phone' name='phone' placeholder='Phone'/>
        <input type='text' id='role' name='role' placeholder='Role'/>
        <div className='center flex'>
          <div className='select_contaner'>
            <input type='checkbox' id='admin' name='admin' checked={admin} onChange={() => {setAdmin(document.getElementById('admin').checked)}}/>
            {admin && (
              <FaCheck  className='checkboxr5 mt5' onClick={() => {setAdmin(false)}}/>
            )}
          </div>
          <label htmlFor='admin'>Admin</label>
        </div>
        <div className='icon_button mt5' onClick={e => {submitHandler(e);}}><FaSave /></div>
      </form>
    </div>
  )
}
