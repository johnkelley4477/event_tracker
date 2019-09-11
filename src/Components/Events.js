/* Third party */
import React, {useState, useEffect} from 'react';
import {navigate} from '@reach/router';
import {FaUserMinus, FaUserPlus,FaCalendarPlus,FaTrash} from 'react-icons/fa';
/* Components */
import firebase from './Firebase';
import NewEvent from './NewEvent';
/* Helpers */
import DateReadable from '../Helpers/formatDateReadable';
import TimeReadable from '../Helpers/formatTimeReadable';
import DateForCal from '../Helpers/formatDateForCal';
import FormatPhone from '../Helpers/formatPhoneDisplay';
import getGoogleMapsURL from '../Helpers/mapsURL';

export default props =>{
  const [eventList,setEventList] = useState([]);
  const [admin,setAdmin] = useState(false);
  const [staff,setStaff] = useState([]);
  let panelStyle = {
    display:'none'
  }
  const deleteRecord = (e,id,category) => {
    e.preventDefault();
    const ref = firebase.database().ref(`${category}/${props.company}/${id}`);
    ref.remove();
    const panels = document.getElementsByClassName('panel');
    for(let p = 0;p<panels.length;p++){
      panels[p].style.display='none';
    }
    getEvents(props.company);
  }
  const deleteStaffWorkingRecord = (e,id,category,staffId) => {
    e.preventDefault();
    const ref = firebase
      .database()
      .ref(`${category}/${props.company}/${id}`);
    ref.on('value', snapshot => {
        const staff = snapshot.val().staff;
        if(staff !== undefined){
          staff.forEach((s,i) => {
            if(s.id === staffId){
              staff.splice(i,1);
              ref.update({staff:staff});
            }
          });
        }else{
          ref.update({staff: []});
        }
        ref.off();
        getEvents(props.company);
      });
  }
  const aOrAn = str => {
    const vowels = ['a','e','i','o','u'];
    const first = str.charAt(0).toLowerCase();
    for(let v in vowels){
      if(vowels[v] === first)
        return 'An';
    }
    return 'A';
  }
  const addStaff = (e, id, email) => {
    e.preventDefault();
    const staff = firebase.database().ref(`Staff/${props.company}`).orderByChild('email').equalTo(email);
    staff.once('value')
      .then(snapshot => {
        const s = snapshot.val();
        const key = Object.keys(s)[0];
        const staffObj = {
          id:key,
          firstName: s[key].firstName,
          lastName: s[key].lastName,
          phone: s[key].phone,
          email: s[key].email
        }
        const events = firebase.database().ref(`Events/${props.company}/${id}`);
        events.once('value')
        .then(snapshot => {
          if(snapshot.hasChild('staff')){
            const staffArray = snapshot.val().staff;
            staffArray.push(staffObj);
            events.update({staff: staffArray});
          }else{
            events.update({staff: [staffObj]});
          }
          getEvents(props.company);
        })
      });
  }
  const getEvents = companyId => {
    const events = firebase
      .database()
      .ref(`Events/${companyId}`)
      .orderByChild('eventDate')
      .startAt(DateForCal(new Date()));
      events.once('value')
      .then(snapshot => {
        setEventList(Object.entries(snapshot.val()));
      })
      .catch(error => {
        navigate('/');
      });
  }
  useEffect(() => {
    if(props.company){
      const user = firebase
        .database()
        .ref(`Staff/${props.company}`)
        .orderByChild('email')
        .equalTo(props.email);
      user.on('value', snapshot => {
        if(snapshot.val() !== null){
          const staffArray = Object.entries(snapshot.val());
          setAdmin(staffArray[0][1].admin);
          getEvents(props.company);
          if(staffArray[0][1].admin){
            const staff = firebase
              .database()
              .ref(`Staff/${props.company}`);
            staff.on('value', snapshot => {
              if(snapshot.val() !== null){
                const staffArray = Object.entries(snapshot.val());
                setStaff(staffArray);
              }
            });
          }
        }
      });
    }else{
      navigate('/');
    }
  },[props.company,props.email]);
  return (
    <div className='phone_width center'>
    <h2>Events</h2>
    {eventList.map((event,i) => {
      let notSignedUp = true;
      let emails = [];
      return(
        <div key={i.toString()}>
        <div id={'accordion' + i} className='accordion heightDouble' onClick={() => {
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
          }}>
            <span className='w70'>{event[1].name}</span>
            <span className='w30 dateLayout'>
              {DateReadable(event[1].eventDate)}
              <span className='sub'>{TimeReadable(event[1].eventTime)}</span>
            </span>
          </div>
          <div id={'panel' + i} className='panel' style={panelStyle}>
            <div className='border'>
            <div>
              <div className={`mt5 font1_2 bold ${admin ? 'flleft w75' : 'flleft w100'}`}>{aOrAn(event[1].type)} {event[1].type} at <a href={getGoogleMapsURL(JSON.parse(event[1].location).address)} target='_blank' rel='noopener noreferrer'>{JSON.parse(event[1].location).name}</a></div>
              {admin && (
                <div className='icon_button flright' onClick={e => {deleteRecord(e,event[0],'Events')}}><FaTrash /></div>
              )}
              <div className='mt5 clear'>{event[1].description}</div>
              {event[1].staff !== undefined &&(
                <div>
                  <div className='mt5 font1_2 bold'>Signed up</div>
                  {event[1].staff.map((staff,i) => {
                    return(
                      <div key={i.toString()}>
                        <div className='hidden'>{emails.push(staff.email)}</div>
                        <div className='grid w75 flleft pt5'>
                          <span>{staff.firstName} {staff.lastName}</span>
                          <span><a href={`tel:+1${staff.phone}`}>{FormatPhone(staff.phone)}</a></span>
                        </div>
                        {(props.email === staff.email || admin) && (
                          <div>
                            {notSignedUp = false}
                            <div className='icon_button flright' onClick={e => {deleteStaffWorkingRecord(e,event[0],'Events',staff.id)}}><FaUserMinus /></div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              {admin && (
                <div>
                  <select id={`addStaff${i}`} defaultValue='-' onChange={e => {
                      const sel = document.getElementById(`addStaff${i}`);
                      if(sel.value !== '-'){
                        addStaff(e,event[0], sel.value);
                        sel.value = '-';
                      }
                    }
                  }>
                    <option value='-'>Add Staff</option>
                    {staff.map((staffer,i) => {
                      const email = emails.find(email => {
                        return email === staffer[1].email;
                      });
                      return(
                        <option key={i.toString()} value={staffer[1].email} disabled={email === staffer[1].email ? true : false}>
                          {`${staffer[1].firstName} ${staffer[1].lastName} ${staffer[1].role}`}
                        </option>
                      )
                    })}
                  </select>
                </div>
              )}
            </div>
            {(notSignedUp && !admin) && (
              <div className='icon_button flright' onClick={e => {addStaff(e,event[0], props.email)}}><FaUserPlus /></div>
            )}
          </div>

          </div>
        </div>
      )
    })}
    {admin && (
      <div className='clear'>
        <div className='icon_button mt5' onClick={() => {
        let show = document.getElementById('panelNew');
        if(show.style.display === 'none'){
            show.style.display = 'block';
          }else{
            show.style.display = 'none';
          }
        }}><FaCalendarPlus /></div>
        <div id='panelNew' className='panel' style={panelStyle}>
          <NewEvent user={props.company}/>
        </div>
      </div>
    )}
    </div>
  )
}
