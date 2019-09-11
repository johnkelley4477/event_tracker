/* Third party */
import React, {useState} from 'react';
import {FaSave,FaWindowClose} from 'react-icons/fa';
/* Components */
import firebase from './Firebase';

export default props => {
  const [venueName,setVenueName] = useState('');
  const [address,setAddress] = useState('');
  const [isEnabled, setEnabled] = useState(true);
  const completed = () => {
    if (venueName !== '' && address !== ''){
      setEnabled(true);
    }else{
      setEnabled(false);
    }
  }
  const submitHandler = e => {
    e.preventDefault();
		const venue = {
			name: venueName,
			address: address
		}
		const ref = firebase
			.database()
			.ref(`Venues/${props.user}`);
		ref.push(venue)
      .then(() => {
        clearForm();
        window.location.reload();
      });
  }
  const clearForm = () => {
    setVenueName('');
    setAddress('');
  }
  return (
    <div id='newVenue' className='modal'>
      <div className='phone_width modal-content'>
        <div className='header flex'>
          <h2 className='w75'>New Venue</h2>
          <span className="close w25" onClick={() => {document.getElementById('NewVenue').style.display = 'none';}} ><FaWindowClose /></span>
        </div>
        <input type='text' id='venueName' name='venueName' placeholder='Venue Name' value={venueName} onChange={() => {setVenueName(document.getElementById('venueName').value)}} onKeyUp={() => {completed()}}/>
        <input type='text' id='address' name='address' placeholder='Venue Address' value={address} onChange={() => {setAddress(document.getElementById('address').value)}} onKeyUp={() => {completed()}}/>
        <div className='icon_button mt5' disabled= {isEnabled ? '' : 'disabled'} onClick={e => {submitHandler(e)}}><FaSave /></div>
      </div>
    </div>
  )
}
