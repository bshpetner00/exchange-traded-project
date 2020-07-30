function updateWeighting(){
  console.log(converted);
  var listed = document.getElementsByClassName("form-control w-100");
  // console.log(listed);
  var keylist = Object.keys(converted['holdings']);
  var percentIn = 0;
  for (item in listed){
    console.log(keylist[item]);
    if (! isNaN(item)){
      if (listed[item].value && converted['holdings'][keylist[item]]){
        converted['holdings'][keylist[item]]['Weight'] = listed[item].value;
        percentIn += parseFloat(listed[item].value);
        console.log(listed[item]);
      }
    }
  }
  console.log(converted);
  const graph2 = document.getElementById("graph2");
  while (graph2.firstChild) {
    graph2.removeChild(graph2.lastChild);
  }
  converted['excludedWeight'] = 100 - percentIn;
  converted['includedWeight'] = percentIn;
  updateStartEnd();
  document.getElementById("title1").innerHTML = "Displaying graph of " + converted["Ticker"] + " made up of its parts weighted by you";
  if (converted['excludedWeight'] != 0){
    document.getElementById("label1").innerHTML = "This balance depicts an ETF with your weighting and excludes " + converted['excludedWeight'].toFixed(3) + "% of it's price because the weightings don't add up to one";
  } else {
    document.getElementById("label1").innerHTML = "This balance depicts an ETF with your weighting as shown below";
  }
}

function setWeightsZero(){
  var listed = document.getElementsByClassName("form-control w-100");
  for (item in listed){
    listed[item].value = 0;
  }
}

function getStartEndInds(data, start_year, end_year){
  var startInd = 0;
  var endInd = 0;
  var result = {};
  // console.log(data);
  for (item in data){
    // console.log(data[item].date.getFullYear());
    if (data[item].date.getFullYear() == start_year){
      startInd = item;
    } else if (data[item].date.getFullYear() == end_year){
      endInd = item;
    }
  }
  result = {start:startInd,end:endInd};
  return result;
}


function updateStartEnd(){
  var startPick = document.getElementById('startPick');
  var endPick = document.getElementById('endPick');
  if (startPick.value == ''){
    startPick.value = '2015';
    // return "";
  } else if (endPick.value == ''){
    endPick.value = '2020';
  }
  if (startPick.value > endPick.value){
    var temp = startPick;
    startPick = endPick;
    endPick = temp;
  }
  // console.log(startPick.value);
  // console.log(endPick.value);
  clear_graphs();
  draw_graph(converted['Ticker'] + ".csv",startPick.value, endPick.value);
  draw_compiled_graph(compileETF(converted),startPick.value, endPick.value);
  doubleGraph(compileETF(converted),startPick.value, endPick.value);
}
