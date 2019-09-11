export default address => {
  const modifiedAddress = address.replace(/ /g,'+');
  return `https://www.google.com/maps/place/${modifiedAddress}`
}
