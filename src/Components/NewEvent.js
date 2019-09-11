/* Third party */
import React, {useState,useEffect} from 'react';
import {navigate} from '@reach/router';
import {FaCalendarPlus,FaWindowClose,FaBuilding} from 'react-icons/fa';
/* Components */
import firebase from './Firebase';
import NewVenue from './NewVenue';
/* Helper */
import formatDate from '../Helpers/formatDateForCal';

export default props => {
  const [name, setName] = useState('');
  const [description,setDescription] = useState('Event Description');
  const [type,setType] = useState('');
  const [location,setLocation] = useState('');
  const [isEnabled,setEnabled] = useState(false);
  const [venueList,setVenueList] = useState([]);
  const [eventDate,setEventDate] = useState(() => {
		const initialState = formatDate(new Date());
		return initialState;
	});
  let panelStyle = {
    display:'none'
  }
  const [eventTime, setEventTime] = useState(() => {
    const date = new Date();
    const minutes = (date.getMinutes()<10?'0':'') + date.getMinutes();
    const hours = (date.getHours()<10?'0':'') + date.getHours();
    return `${hours}:${minutes}`;
  });
  const completed = () => {
    if (
      name !== ''
      && description !== ''
      && type !== ''
      && eventDate !== ''
      && location !== ''
    ) {
      setEnabled(true);
    }else{
      setEnabled(false);
    }
  }
  const submitHandler = e => {
    if(!isEnabled){
      return null;
    }
    e.preventDefault();
		const event = {
			name: name,
			description: description,
			type: type,
			eventDate: eventDate,
      location: location,
			eventTime: eventTime,
      companyId: props.user
		}
		const ref = firebase
			.database()
			.ref(`Events/${props.user}`);
		ref.push(event)
      .then(() => {
        clearForm();
        window.location.reload();
      })
      .catch(e => {
        console.log(e);
      });
      const clearForm = () => {
        setName('');
        setDescription('');
        setType('');
        setLocation('');
        setEnabled(false);
        setEventDate(() => {
      		const initialState = formatDate(new Date());
      		return initialState;
      	});
        setEventTime(() => {
          const date = new Date();
          const minutes = (date.getMinutes()<10?'0':'') + date.getMinutes();
          const hours = (date.getHours()<10?'0':'') + date.getHours();
          return `${hours}:${minutes}`;
        });
      }
  }
  useEffect(() => {
    if(props.user){
      const venue = firebase
        .database()
        .ref(`Venues/${props.user}`)
        .orderByChild('name');
        venue.once('value')
        .then(snapshot => {
          setVenueList(Object.entries(snapshot.val()));
        })
        .catch(error => {
          navigate('/stafflogin');
        });
    }
  },[props.user]);
  return (
    <div  id='newEvent' className='modal'>
      <form onSubmit={submitHandler} className='phone_width modal-content'>
        <div className='header flex'>
          <h2 className='w75'>New Event</h2>
          <span className="close w25" onClick={() => {document.getElementById('panelNew').style.display = 'none';}} ><FaWindowClose /></span>
        </div>
        <input type='date' id='eventDate' name='eventDate' value={eventDate} className='mt25' onChange={() => {setEventDate(document.getElementById('eventDate').value)}} onKeyUp={() => {completed()}}/>
        <input type='time' id='eventTime' name='eventTime' value={eventTime} onChange={() => {setEventTime(document.getElementById('eventTime').value)}} onKeyUp={() => {completed()}} />
        <input type='text' id='name' name='name' value={name} placeholder='Event Name' onChange={() => {setName(document.getElementById('name').value)}} onKeyUp={() => {completed()}} />
        <input type='text' id='type' name='type' value={type} placeholder='Event Type' onChange={() => {setType(document.getElementById('type').value)}} onKeyUp={() => {completed()}} />
        <select id='location' name='location'  onChange={() => {
            const l = document.getElementById('location');
            setLocation(l.options[l.selectedIndex].value);
          }} onKeyUp={() => {completed()}}>
          <option value=''>Choose A Venue</option>
            {venueList.map((venue,i) => {
              return(
                <option key={i.toString()} value={`{"name":"${venue[1].name}","address":"${venue[1].address}"}`}>{venue[1].name}</option>
                )
              })
            }
        </select>
        <div className='icon_button mt5' onClick={() => {
          let show = document.getElementById('NewVenue');
          if(show.style.display === 'none'){
              show.style.display = 'block';
            }else{
              show.style.display = 'none';
            }
          }}><FaBuilding /></div>
        <div id='NewVenue' className='panel' style={panelStyle}>
          <NewVenue user={props.user}/>
        </div>
        <textarea type='text' id='description' name='description' col='3' row='3'
          onClick={() => {
            const desc = document.getElementById('description');
            if(desc.value === 'Event Description'){
              desc.value = '';
              desc.style.color = '#000';
            }
          }}
          onChange={() => {
            setDescription(document.getElementById('description').value);
          }}
          onBlur={() => {
            const desc = document.getElementById('description');
            if(desc.value === ''){
              desc.value = 'Event Description';
              desc.style.color = '#777';
            }
          }}
          value={description}
          onKeyUp={() => {completed()}}>
        </textarea>
        <div className='icon_button mt5' disabled= {isEnabled ? '' : 'disabled'} onClick={e => {submitHandler(e);}}>
          <FaCalendarPlus />
        </div>
      </form>
    </div>
  )
}
