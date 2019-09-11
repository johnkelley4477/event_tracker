export default (t) => {
  const tsplit = t.split(':');
  let hours = parseInt(tsplit[0]);
  if(hours > 12){
    return `${(hours - 12)}:${tsplit[1]} PM`
  }else{
    return `${hours}:${tsplit[1]} AM`
  }
}
