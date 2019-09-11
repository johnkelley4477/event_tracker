/* Third party */
import React, {useState,useEffect} from 'react';
import {FaUserPlus,FaTrash, FaCheck, FaUserEdit, FaTimes } from 'react-icons/fa';
/* Components */
import firebase from './Firebase';
import NewStaff from './NewStaff';
/* Helpers */
import FormatPhone from '../Helpers/formatPhoneDisplay';

export default props => {
  let [staffList,setStaffList] = useState([]);
  let panelStyle = {
    display:'none'
  }
  const deleteRecord = (e,id) => {
    e.preventDefault();
    const ref = firebase.database().ref(`Staff/${props.company}/${id}`);
    ref.remove();
    const panels = document.getElementsByClassName('panel');
    for(let p = 0;p<panels.length;p++){
      panels[p].style.display='none';
    }
  }
  useEffect(() => {
    if(props.company){
      const staff = firebase
        .database()
        .ref(`Staff/${props.company}`)
        .orderByChild('lastName');
      staff.once('value')
      .then(snapshot => {
        setStaffList(Object.entries(snapshot.val()));
      });
      staff.once('child_changed')
      .then(snapshot => {
      //[snapshot.key,snapshot.val()];
      //  setStaffList(snapshot.val());
      });
    }
  } ,[props.company,props.email]);
  return(
    <div className='phone_width center'>
      <h2>Event Staff</h2>
      {staffList.map((staff,i) => {
        return(
          <div key={i.toString()}>
          <div id={'accordion' + i} className='accordion' onClick={() => {
            let show = document.getElementById(`panel${i}`);
            let accordion = document.getElementById(`accordion${i}`);
            if(show.style.display === 'none'){
                show.style.display = 'block';
                accordion.style.color = '#fff';
                accordion.style.background = '#68f';
              }else{
                show.style.display = 'none';
                accordion.style.color = '#68f';
                accordion.style.background = '#fff';
              }
            }}>{staff[1].firstName} {staff[1].lastName}</div>
            <div id={'panel' + i} className='panel' style={panelStyle}>
              <div className='border small'>
                <div className='flleft w75'>
                  <div className='mt5'>
                    <a href={`mailto:${staff[1].email}`}>
                      {staff[1].email}
                    </a>
                  </div>
                  <div className='mt5'>
                    <a href={`tel:+1${staff[1].phone}`}>
                      {FormatPhone(staff[1].phone)}
                    </a>
                  </div>
                  <div className='flex'>
                    <div className='mt5 cap w50'>
                      {staff[1].role}
                    </div>
                    <div className='mt5 cap w50 t_right'>Site Admin
                      <div className='select_contaner'>
                        {staff[1].admin && (
                          <FaCheck  className='checkbox mt5'/>
                        )}
                        {!staff[1].admin && (
                          <FaTimes  className='checkbox mt5'/>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='icon_button flright' onClick={e => {deleteRecord(e,staff[0])}}><FaTrash/></div>
                <div className='icon_button flright mt5' onClick={() => {
                    document.getElementById('panelEdit').style.display = 'block';
                    document.getElementById('firstName').value = staff[1].firstName;
                    document.getElementById('lastName').value = staff[1].lastName;
                    document.getElementById('email').value = staff[1].email;
                    document.getElementById('phone').value = staff[1].phone;
                    document.getElementById('role').value = staff[1].role;
                    document.getElementById('admin').checked = staff[1].admin;
                    document.getElementById('staffId').value = staff[0];
                  }}>
                    <FaUserEdit />
                </div>
              </div>
            </div>
          </div>
        )
      })}
        <div className='clear'>
          <div className='icon_button mt5' onClick={() => {
				        document.getElementById('panelEdit').style.display = 'block';
                document.getElementById('firstName').value = '';
                document.getElementById('lastName').value = '';
                document.getElementById('email').value = '';
                document.getElementById('phone').value = '';
                document.getElementById('role').value = '';
                document.getElementById('admin').checked = '';
                document.getElementById('staffId').value = '~';
  				}}>
            <FaUserPlus />
          </div>
          <div id='panelEdit' className='panel' style={panelStyle}>
            <NewStaff id='staff' user={props.company} userData='' userId=''/>
          </div>
      </div>
    </div>
  )
}
