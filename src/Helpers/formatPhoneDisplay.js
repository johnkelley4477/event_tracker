export default phone => {
  if(phone !== undefined && phone.length === 10){
    return (`(${phone.substr(0,3)})${phone.substr(3,3)}-${phone.substr(6,4)}`)
  }else{
    return false;
  }
}
