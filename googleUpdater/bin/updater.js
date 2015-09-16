/**
 * Author: John Handley
 * FileName: updater.js
 * Description: This is the main file for the application to schedule
 *     restful web calls to the wpt charts api also running on this
 *     machine.
 */
var request = require('request'); //For:
var Google  = require('google-spreadsheet') //For:
var debug   = require('debug'); //For:

// With auth -- read + write 
var creds = require('../creds.json');

// spreadsheet key is the long id in the sheets URL
var my_sheet = new Google('1MS7tWiXsFSdd8O28E4TUFreJGZg2QJLrYjZYerYYCV4');
var prod_sheet = new Google('19jc6lPYqnHa-dn3KypCCmslkieDJwgYZz5_W6kQXA4A');

//How many minutes to wait until update
var min = 60;

//The true interval for update wait
var interval = min * 60 * 1000;


debug('Setting update for every ' + min + ' minutes');
setInterval(function(){
  // Call the updater for each test you want to have on
  // the google spreadsheet.
  runUpdates();
}, interval);

runUpdates();

/**
 * 
 * 
 * 
 */
function runUpdates(){ 
  my_sheet.useServiceAccountAuth(creds, function(err){
    my_sheet.getInfo( function( err, sheet_info ){
      var testsSheet = sheet_info.worksheets[0];//This is the config sheet
      testsSheet.getRows( 1, function(err, row_data){
        for(var index = 0; index < row_data.length; index++){
          //To Do: Add Checks to make sure that partial or erroneous data won't be accepted

          if(row_data[index].suiteid == ''){
            continue;
          }
          if(row_data[index].metric  == ''){
            continue;
          }
          if(row_data[index].numberofdays == ''){
            continue;
          }
          if(row_data[index].row == ''){
            continue;
          }
          if(row_data[index].column == ''){
            continue;
          }
          if(row_data[index].testid == ''){
            continue;
          }

          var url = "http://localhost:3000/tests/" + row_data[index].suiteid 
            + "?chartType=" + row_data[index].metric + "&dataRange=0%2C8000&dateCutoff=" +
            + row_data[index].numberofdays;
          var row = row_data[index].row;
          var col = letterToNumber(row_data[index].column) + '';
          var testId = row_data[index].testid;
          var test;
          var website;
          
          switch(row_data[index].website){
            case "Safety":
              website = 0;
              break;
            case "Credentials":
              website = 1;
              break;
            case "GPS":
              website = 2;
              break;
            case "Skills":
              website = 3;
              break;
            case "Fill-In-Forms":
              website = 4;
              break;
            default:
              //Should Be Impossible
              continue;
          }
                    
          makeRequest(url, website, row, col, test, testId);
        }
      });
    });
  })
}

/**
 * 
 * 
 * 
 */
function update(theUrl, index, worksheet, test){
  request(theUrl , function(err, response, data) {
    if(err){
      console.error("There was an error with the resftul call please check network");
      return;
    }
    var packet = JSON.parse(data);
    if(packet.error_message){
      console.error("The server is experiencing an issue: " + packet.error_message);
      return;
    }
    var chart = packet.charts[test];
    var testLink = chart.suiteId;
    var average;
    var sum = 0;
    
    
    chart.fvValues.forEach(function(dataPoint){
      sum += dataPoint[1];
    });
    average = ((sum/chart.fvValues.length)/1000).toPrecision(2);
          
    prod_sheet.useServiceAccountAuth(creds, function(err){
      prod_sheet.getInfo( function( err, sheet_info ){
        var sheet1 = sheet_info.worksheets[worksheet];
        sheet1.getCells( function( err, cells ){
          cells[index].setValue(average, function(err){
          });
        });
      });
    })   
  });
} 

/**
 * 
 * 
 * 
 */
function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    var min  = date.getMinutes();
    var sec  = date.getSeconds();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day  = date.getDate();
    
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

/**
 * 
 * 
 * 
 */
function getCellIndex(url, worksheet, row, col, test, callback){
   prod_sheet.useServiceAccountAuth(creds, function(err){
      prod_sheet.getInfo( function( err, sheet_info ){
        var sheet1 = sheet_info.worksheets[worksheet];
        sheet1.getCells( function( err, cells ){
          for(var index = 0; index < cells.length; index++){
            var cell = cells[index];
            if(cell.row == row && cell.col == col){
              callback(url, worksheet, test, index);
            }
          }
        });
      });
    })
}

function makeRequest(url, website, row, col, test, testId){
  request(url, function(err, response, data) {
    if(err){
      console.error("There was an error with the restful call please check network");
      return;
    }
    var packet = JSON.parse(data);
    if(packet.error_message){
      console.log(url);
      console.error("The server is experiencing an issue: " + packet.error_message);
      return;
    }

    for(var i = 0; i < packet.tests.length; i++){
      if(packet.tests[i] == testId){
        test = i;
      }

    }

    getCellIndex(url, website, row, col, test,
      function(theUrl, theWebsite, theTest, cellIndex){
        update(theUrl, cellIndex, theWebsite, theTest);
      }
    );
  });
} 

function letterToNumber(letter){
  switch(letter){
    case "A":
    return 1;
    case "B":
    return 2;
    case "C":
    return 3;
    case "D":
    return 4;
    case "E":
    return 5;
    case "F":
    return 6;
    case "G":
    return 7;
    case "H":
    return 8;
    case "I":
    return 9;
    case "J":
    return 10;
    case "K":
    return 11;
    case "L":
    return 12;
    case "M":
    return 13;
    case "N":
    return 14;
    case "O":
    return 15;
    case "P":
    return 16;
    case "Q":
    return 17;
    case "R":
    return 18;
    case "S":
    return 19;
    case "T":
    return 20;
    case "U":
    return 21;
    case "V":
    return 22;
    case "W":
    return 23;
    case "X":
    return 24;
    case "Y":
    return 25;
    case "Z":
    return 26;
    default:
    return 1;
  }
}
