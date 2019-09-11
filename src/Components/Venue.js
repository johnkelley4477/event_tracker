/* Third party */
import React, {useState,useEffect} from 'react';
import {FaBuilding,FaTrash } from 'react-icons/fa';
/* Components */
import firebase from './Firebase';
import NewVenue from './NewVenue';
/* Helperd */
import getGoogleMapsURL from '../Helpers/mapsURL';

export default props => {
  const [venueList,setVenueList] = useState([]);
  let panelStyle = {
    display:'none'
  }
  const deleteRecord = (e,id) => {
    e.preventDefault();
    const ref = firebase.database().ref(`Venues/${props.company}/${id}`);
    ref.remove();
    const panels = document.getElementsByClassName('panel');;
    for(let p = 0;p<panels.length;p++){
      panels[p].style.display='none';
    }
    window.location.reload();
  }
  useEffect(() => {
    if(props.company){
      let venueL = [];
      const venue = firebase
        .database()
        .ref(`Venues/${props.company}`)
        .orderByChild('name');
        venue.on('child_added',child => {
          let childObj = child.val();
          childObj.id = child.key;
          venueL.push(childObj);
          venue.off();
          setVenueList(venueL);
        });
    }
  },[props.company]);
  return(
    <div className='phone_width center'>
      <h2>Venus</h2>
      {venueList.map((venue,i) => {
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
            }}>{venue.name}</div>
            <div id={'panel' + i} className='panel' style={panelStyle}>
              <div className='border small'>
                <div className='flleft w75'>
                  <div className='mt5'><a href={getGoogleMapsURL(venue.address)}>{venue.address}</a></div>
                </div>
                <div className='icon_button flright' onClick={e => {deleteRecord(e,venue.id)}}><FaTrash /></div>
              </div>
            </div>
          </div>
        )
      })}
        <div className='clear'>
          <div className='icon_button mt5' onClick={() => {
  				let show = document.getElementById('NewVenue');
  				if(show.style.display === 'none'){
  						show.style.display = 'block';
  					}else{
  						show.style.display = 'none';
  					}
  				}}><FaBuilding /></div>
          <div id='NewVenue' className='panel' style={panelStyle}>
            <NewVenue user={props.company}/>
          </div>
        </div>
    </div>
  )
}
