function updateWeighting(){
  console.log(converted);
  var listed = document.getElementsByClassName("form-control w-100");
  // console.log(listed);
  var keylist = Object.keys(converted['holdings']);
  var percentIn = 0;
  for (item in listed){
    console.log(keylist[item]);
    if (! isNaN(item)){
      converted['holdings'][keylist[item]]['Weight'] = listed[item].value;
      percentIn += listed[item].value;
    }
  }
  console.log(converted);
  const graph2 = document.getElementById("graph2");
  while (graph2.firstChild) {
    graph2.removeChild(graph2.lastChild);
  }
  converted['excludedWeight'] = 100 - percentIn;
  converted['includedWeight'] = percentIn;
  compileETF(converted);
  document.getElementById("title1").innerHTML = "Displaying graph of " + converted["Ticker"] + " made up of its parts weighted by you";
  if (converted['excludedWeight'] != 0){
    document.getElementById("label1").innerHTML = "This balance depicts an ETF with your weighting and excludes " + converted['excludedWeight'].toFixed(3) + "% of it's price because the weightings don't add up to one";
  } else {
    document.getElementById("label1").innerHTML = "This balance depicts an ETF with your weighting as shown below";
  }
}
