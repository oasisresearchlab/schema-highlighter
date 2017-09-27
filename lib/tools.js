isInList = function(member, list, field, compare) {
  /******************************************************************
   * Check if a given object is in the list
   * @params
   *    member - the object to compare
   *    list - the list that shoudl contain the object
   *    field - (optional) a subfield of the member and list objects
   *        on which to compare
   *    compare - (optional) comparison function to use
   *****************************************************************/
  // logger.debug("Searching for " + 
  //     JSON.stringify(member) + " in list with contents: " + 
  //     JSON.stringify(list));
  var result = false;
  list.forEach(function(obj) {
    // logger.trace("Checking for match with: " + JSON.stringify(obj));
    if (field) {
      if (typeof(obj[field]) === 'string' && 
          typeof(member[field]) === 'string') {
        // logger.trace("comparing 2 strings");
        if (obj[field].localeCompare(member[field]) === 0) {
          result = true; 
        }
      } else {
        if (obj[field] == member[field]) {
          result = true;
        }
      }

    } else {
      if (obj == member) {
        result = true;
      }
    }
  });
  return result;
};

trimFromString = function(target, substring) {
  // logger.debug("triming " + substring + " from target: " + target);
  var split = target.split(substring);
  var result = "";
  split.forEach(function(str) {
    result += str;
    // logger.debug("after trim got: " + result);
  });
  return result;
}

getRandomElement = function (array) {
    /****************************************************************
    * get a random element in a given array
    ****************************************************************/
    var myRand = Math.floor(Math.random()*1024);
    //Divide range of 1024 evenly between number of condidions
    var interval = Math.floor(1024/array.length); 
    for (var i=0; i<array.length; i++) {
      if ((myRand >= interval * i) && (myRand < interval * (i + 1))) {
        return array[i];
      } 
    }
    //If exiting without a return, then myRand was in the small rounding
    // error margin at the top of the range
    return array[array.length - 1];
};