export default (d) => {
  const dsplit = d.split('-');
  const date = new Date(dsplit[0] + "," + dsplit[1] + "," + dsplit[2]);
  var day = date.getDate();
  var monthIndex = date.getMonth() + 1;
  var year = date.getFullYear();
  return monthIndex + '/' + day + '/' + year;
}
