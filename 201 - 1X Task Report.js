var cust_tab_uid = '';
var WO_tab_uid = '';
var cust_grid_data = [];
var WO_Table;
var accessToken = '';
var ws = '';
var host = '';
var dataSetWO = [];
var dataSetWONew = [];
var dataSetWOOpen = [];
var case_status = [];
const taskMatrix = [
  ['', '', '', '', 'Give Comp. Back to R&S', 'T/D Report Approval', 'Tear Down Report', 'Tear Down Routing', 'Job Accomplishment Report', 'Certifying Staff Confirmation'],
  ['', '', '', '', '', '', '', '', 'Pre-Operation Keeping', ''],
  ['', 'Add to Cap List Consideration', '', '', '', 'Work Instruction Detail', '', '', '', 'Form Issue'],
  ['', '', '', '', 'Planning Permission', '', '', '', '', ''],
  ['', '', 'Preliminary Comp. and Doc. Check', 'Return Comp. & Docs to Customer', '', '', '', '', 'Sending Job', 'Deliver Comp. to Customer'],
  ['Basic Comp. Information', 'Comp. Repair Cond.', 'Apply Changes', 'Request Cancelation', 'Customer Service Agreement', 'Waiting List Mgmt.', '', '', 'Delivery Coordination', '']
];

$("#button0000000001").click(function(){
	$("#96058102066fe6b1e2d7934067538371").saveForm();
	$("#96058102066fe6b1e2d7934067538371").closeForm();
  	
});

$("#rdOpenCases").setOnchange(function (newVal, oldVal) {
  if (newVal == "1") {
    var tabDataSet = dataSetWONew.filter(item => item['dropdowncompletion_code_label'] == null || item['dropdowncompletion_code_label'] == '');
    drawTable("#WO-list-panel", tabDataSet);
    drawTaskChart("taskWOChart", "taskAvgChart", tabDataSet);
    drawUserChart("taskUserChart", tabDataSet);
    drawShopChart("shopWOChart", tabDataSet);
    drawMonthChart("monthWOChart", tabDataSet);
  }else{
    var tabDataSet = dataSetWONew;
    drawTable("#WO-list-panel", tabDataSet);
    drawTaskChart("taskWOChart", "taskAvgChart", tabDataSet);
    drawUserChart("taskUserChart", tabDataSet);
    drawShopChart("shopWOChart", tabDataSet);
    drawMonthChart("monthWOChart", tabDataSet);
  }
});

$("document").ready(function () {
  accessToken = PMDynaform.getAccessToken();
  ws = PMDynaform.getWorkspaceName();
  //alert(ws);	
  host = PMDynaform.getHostName();
  //$("#grdCaseTask").hide();
  //$("#textareaVar001").hide();
  //$("#textareaVar002").hide();
  //$("#textareaVar003").hide();
  $("#textareaVar005").setValue('');

  ////////////////////////////////// retrieving WO tab_uid ///////////////////////////////////

  var req_wtab_uid = new XMLHttpRequest();
  req_wtab_uid.onreadystatechange = function () {
    //alert(req_tab_uid.status + " -- " + req_tab_uid.readyState);
    var awTables = (JSON) ? JSON.parse(req_wtab_uid.responseText) : eval(req_wtab_uid.responseText);
    //alert("tables   :" + req_wtab_uid.responseText);
    var req_wtab = awTables.filter(item => item.rep_tab_name === "PMT_REP_REQUEST");
    //alert(JSON.stringify(req_wtab));
    WO_tab_uid = req_wtab[0].rep_uid;
    //alert(WO_tab_uid);
  }

  req_wtab_uid.open("GET", host + "/api/1.0/" + ws + "/project/" + "583627017659f822ac26711071197694/report-tables", false);
  req_wtab_uid.setRequestHeader("Authorization", "Bearer " + accessToken);
  req_wtab_uid.send();

  ///////////////////////////////// retreiving data from WO report table ////////////////////////////////

  var temp_req = new XMLHttpRequest();
  temp_req.onreadystatechange = function () {
    var arepReqRecords = (JSON) ? JSON.parse(temp_req.responseText) : eval(temp_req.responseText);
    dataSetWO = arepReqRecords.rows;
    //var dataSetWONew = dataSetWO.map((item) => (Object.assign({},item,{'curr_task': $("#grdCaseTask").getValue().filter(x => x[0] === item['app_number'])})));
    //alert(dataSetWO.length);
    dataSetWONew = dataSetWO.map(function (item, index) {
      //alert(item['app_number']);
      //alert(item['app_number']);
      var temp_task = $("#grdCaseTask").getValue().filter(x => x[0] == item['app_number']);
      //item['datetimeord_rec'] = item['datetimeord_rec'].slice(0, 10);
	  //$("#textareaVar001").setValue($("#textareaVar001").getValue() + item['app_number']);
      if (item['datetimecompletion']) {
        item['datetimecompletion'] = item['datetimecompletion'].slice(0, 10);
        if (item['datetimecompletion'] == "0000-00-00") {
          item['datetimecompletion'] = "";
        }
      }
      
	  //$("#textareaVar001").setValue($("#textareaVar001").getValue() + item['textvarpart_number']);
      if (item['datetimerequestfindt']) {
        item['datetimerequestfindt'] = item['datetimerequestfindt'].slice(0, 10);
        if (item['datetimerequestfindt'] == "0000-00-00") {
          item['datetimerequestfindt'] = "";
        }
      }
      

      return Object.assign({}, item, { 'curr_task': temp_task[0][1], 'curr_user': temp_task[0][2], 'row': index + 1, 'tdUrl': '---', 'srUrl': '---', 'duration': parseInt(temp_task[0][5]), 'init_dt': temp_task[0][6]});
    });
    dataSetWONew = dataSetWONew.filter(item => item['app_status'] != 'CANCELLED' && item['app_status'] != 'DRAFT').filter(item => item['textvarcustomer'] != 'TestTest Co.');
    //$("#textareaVar002").setValue(JSON.stringify(dataSetWONew) + "   " + dataSetWO.length + "  " + dataSetWONew.length);
    //$("#textareaVar001").setValue(JSON.stringify($("#grdCaseTask").getValue()));
    //dataSetWOOpen = dataSetWONew.filter(item => item['dropdowncompletion_code_label'] == "");
  }

  var qu = "/api/1.0/" + ws + "/project/583627017659f822ac26711071197694/report-table/" + WO_tab_uid + "/data";
  temp_req.open("GET", qu, false);
  temp_req.setRequestHeader("Authorization", "Bearer " + accessToken);
  temp_req.send();

  drawTable("#WO-list-panel", dataSetWONew);
  drawTaskChart("taskWOChart", "taskAvgChart", dataSetWONew);
  drawUserChart("taskUserChart", dataSetWONew);
  drawShopChart("shopWOChart", dataSetWONew);
  drawMonthChart("monthWOChart", dataSetWONew);
  
});

function drawTable(tab_id, a_dataSet){
  if($.fn.DataTable.isDataTable(tab_id)){
    $(tab_id).DataTable().destroy();
    //$(tab_id).DataTable().clear()
    //$(tab_id).DataTable().draw()
    //WO_Table.draw();
  }
  WO_Table = $(tab_id).DataTable({
	//scrollX: true,
    autoWidth: true,
    order: [1, 'asc'],
    data: a_dataSet,
    columns: [
      { title: 'Row', data: 'row', width: '2%'},
      { title: 'App Number', data: 'app_number', width: '3%'},
      { title: 'Customer', data: 'textvarcustomer' },
      { title: 'Nomenclature', data: 'textvarcomp_nom' },
      { title: 'Part Number', data: 'textvarpart_number' },
      { title: 'Serial Number', data: 'textvarserial_no', width: '5%'},
      { title: 'Work Order', data: 'textwon' },
      { title: 'Main Shop', data: 'textmaindhop_label' },
      { title: 'Date Rec.', data: 'datetimeord_rec' },
      { title: 'Current Task', data: 'curr_task' },
      { title: 'Current User', data: 'curr_user' },
      { title: 'Shop Supervisor', data: 'textshpsupervisor' },
      { title: 'Priority', data: 'dropdowninitpriority_label' },
      { title: 'Comp. Stat', data: 'dropdowncompletion_code_label' },
      { title: 'Comp. Date', data: 'datetimecompletion' },
      { title: 'Order Stat', data: 'dropdownfinalreqstat_label' },
      { title: 'Order Fin. Date', data: 'datetimerequestfindt' },
      { title: 'TD', data: 'tdUrl'},
      { title: 'SR', data: 'srUrl'},
      { title: 'Duration', data: 'duration'},
      { title: 'Init. DT', data: 'init_dt'},
    ],
    select: {
      style: 'os',
      selector: 'td:not(:first-child)'
    },
    layout: {
      scrollX: true,
      topStart: {
        buttons: ['copy',
          'csv',
          'excel',
          {
            extend: 'pdfHtml5',
            orientation: 'landscape',
            pageSize: 'LEGAL',
            title: 'TOTAL WORK ORDER REPORT'
          },
          'print']
      }
    },
    //drawCallback: function(settings){
    		//var api = this.api();
            //var row = select.closest('tr');
			 //api.column(17).nodes().each(function(c){
              //var temp_cell = $("#grdCaseTask").getValue().filter(item => item[0] == );;
             //});
            //api.column(17).nodes().to$().html("<a href='"+ +"'>T/D Rep.</a>");
            //api.column(18).nodes().to$().html("<>");
    //}
  });
  WO_Table.rows().every(function(rowIdx, tableLoop, rowLoop){
  	var data = this.data();
    var rowLink = $("#grdCaseTask").getValue().filter(item => item[0] == data['app_number'])[0];
    //$("#textareaVar005").setValue($("#textareaVar005").getValue() + tdTabLink + '------' + data['textwon'] + '   \n');
    if(rowLink[3] != ''){
      var tdTabLink = "<a href='" + rowLink[3] + "' target = '_blank'> T/D Rep.</a>";
      WO_Table.cell(rowIdx, 17).data(tdTabLink).draw();
    }
    
    if(rowLink[4] != ''){
      var srTabLink = "<a href='" + rowLink[4] + "' target = '_blank'> S/R Rep.</a>";
      WO_Table.cell(rowIdx, 18).data(srTabLink).draw();
    }
  });
}

function drawTaskChart(task_chart_id, task_avg_chart_id, a_task_chart_data){

  ////////////////////////////////////// categorize by curr_task //////////////////////////////////////
  var cat_task = a_task_chart_data.reduce((acc, item) => {
    if (!acc[item.curr_task]) {
      acc[item.curr_task] = { count: 0, parts: [], dur_sum: 0, dur_avg: 0};
    }
    acc[item.curr_task].parts.push(item);
    acc[item.curr_task].count += 1;
    acc[item.curr_task].dur_sum += item.duration;
    acc[item.curr_task].dur_avg = acc[item.curr_task].dur_sum / acc[item.curr_task].count;
    return acc;

  }, {});

  ////////////////////////////////////// preparing task chart //////////////////////////////////////////////  
  var task_chart_data = [];
  var task_avg_data = [];
  Object.keys(cat_task).forEach(key => {
    var temp_arr_task = [];
    temp_arr_task.push({ 'task': key, 'count': cat_task[key].count, 'dur_avg': parseInt(cat_task[key].dur_avg) });
    task_chart_data.push(temp_arr_task);
  });
  
  const xValues = task_chart_data.map((item, index) => item[0].task);
  const yValues = task_chart_data.map((item, index) => item[0].count);
  const zValues = task_chart_data.map((item, index) => item[0].dur_avg);

  var taskWOChartData = [{
    x: xValues,
    y: yValues,
    type: 'bar',
    text: yValues.map(String),
    textposition: 'auto',
    hoverinfo: 'none',
    marker: {
      color: 'rgba(20,230,80,.5)',
      line: {
        color: 'rgb(8,48,107)',
        width: 1.5
      }
    }
  }];
  
  var taskWOChartLayOut = {
    title: 'STATION WORK ORDER COUNT'
  };

  var taskAvgDurData = [{
    x: xValues,
    y: zValues,
    type: 'bar',
    text: zValues.map(String),
    textposition: 'auto',
    hoverinfo: 'none',
    marker:{
      color: 'rgba(200,30,50,0.5)',
      line: {
        color: 'rgb(8,48,100)',
        width: 1.5
      }
    }
  }];

  var taskAvgDurLayOut = {
    title: 'STATION Average Duration'
  };

  Plotly.newPlot(task_chart_id, taskWOChartData, taskWOChartLayOut);
  drawHeatMap(task_chart_data);
  Plotly.newPlot(task_avg_chart_id, taskAvgDurData, taskAvgDurLayOut);

}
  
function drawUserChart(user_chart_id, a_user_chart_data){
  //////////////////////////////////categorize based on user ///////////////////////////////////////
  var cat_user = a_user_chart_data.reduce((acc, item) => {
    if (!acc[item.curr_user]) {
      acc[item.curr_user] = { count: 0, parts: [] };
    }
    acc[item.curr_user].parts.push(item);
    acc[item.curr_user].count += 1;
    return acc;

  }, {});
   /////////////////////////////////// preparing user chart ////////////////////////////////////////////////////
  
   var user_chart_data = [];
   Object.keys(cat_user).forEach(key => {
     var temp_arr_task = [];
     temp_arr_task.push({ 'user': key, 'count': cat_user[key].count });
     user_chart_data.push(temp_arr_task);
   });
    
   const xValuesUser = user_chart_data.map((item, index) => item[0].user);
   const yValuesUser = user_chart_data.map((item, index) => item[0].count);
 
   var taskUserChartData = [{
     x: xValuesUser,
     y: yValuesUser,
     type: 'bar',
     text: yValuesUser.map(String),
     textposition: 'auto',
     hoverinfo: 'none',
     marker: {
       color: 'rgba(10,150,250,.5)',
       line: {
         color: 'rgb(8,48,107)',
         width: 1.5
       }
     }
   }];
   
   var taskUserChartLayOut = {
     title: 'WORK ORDER ASSIGNED TO USERS'
   };
  Plotly.newPlot(user_chart_id, taskUserChartData, taskUserChartLayOut);

}   

function drawShopChart(shop_chart_id, a_shop_chart_data){
  //////////////////////////////////categorize based on shop ///////////////////////////////////////
  var cat_shop = a_shop_chart_data.reduce((acc, item) => {
    var shop_index = "";
    if (item.textmaindhop_label == null || item.textmaindhop_label == "") {
      shop_index = "No Shops Determined";
    } else {
      shop_index = item.textmaindhop_label;
    }
    if (!acc[shop_index]) {
      acc[shop_index] = { count: 0, parts: [] };
    }
    acc[shop_index].parts.push(item);
    acc[shop_index].count += 1;
    return acc;

  }, {});

   /////////////////////////////////// preparing shop chart ////////////////////////////////////////////////////
  
   var shop_chart_data = [];
   Object.keys(cat_shop).forEach(key => {
     var temp_arr_task = [];
     temp_arr_task.push({ 'shop': key, 'count': cat_shop[key].count });
     shop_chart_data.push(temp_arr_task);
   });
   //$("#textareaVar003").setValue(JSON.stringify(cat_shop));
 
 
   const xValuesShop = shop_chart_data.map((item, index) => item[0].shop);
   const yValuesShop = shop_chart_data.map((item, index) => item[0].count);
   //alert("241" + "   " + xValuesShop.lenght + "    " + yValuesShop.length); 
   var shopWOChartData = [{
     x: xValuesShop,
     y: yValuesShop,
     type: 'bar',
     text: yValuesShop.map(String),
     textposition: 'auto',
     hoverinfo: 'none',
     marker: {
       color: 'rgba(190,50,250,.5)',
       line: {
         color: 'rgb(8,48,107)',
         width: 1.5
       }
     }
   }];
   $("#textareaVar002").setValue(JSON.stringify(xValuesShop) + JSON.stringify(yValuesShop));
 
   var shopWOChartLayOut = {
     title: 'WORK ORDER COUNT IN SHOPS'
   };
   Plotly.newPlot(shop_chart_id, shopWOChartData, shopWOChartLayOut);
}
 
function drawMonthChart(month_chart_id, a_month_chart_data){
  //////////////////////////////////categorize based on month ///////////////////////////////////////
  var cat_month = a_month_chart_data.reduce((acc, item) => {
    if (!acc[item.datetimeord_rec.slice(0, 7)]) {
      acc[item.datetimeord_rec.slice(0, 7)] = { count: 0, parts: [] };
    }
    acc[item.datetimeord_rec.slice(0, 7)].parts.push(item);
    acc[item.datetimeord_rec.slice(0, 7)].count += 1;
    return acc;

  }, {});

 /////////////////////////////////// preparing month chart ////////////////////////////////////////////////////

  var month_chart_data = [];
  Object.keys(cat_month).forEach(key => {
    var temp_arr_month = [];
    temp_arr_month.push({ 'month': key, 'count': cat_month[key].count });
    month_chart_data.push(temp_arr_month);
  });
  
  const xValuesMonth = month_chart_data.map((item, index) => item[0].month);
  const yValuesMonth = month_chart_data.map((item, index) => item[0].count);

  var monthWoChartData = [{
    x: xValuesMonth,
    y: yValuesMonth,
    type: 'bar',
    text: yValuesMonth.map(String),
    textposition: 'auto',
    hoverinfo: 'none',
    marker: {
      color: 'rgba(58,200,225,.5)',
      line: {
        color: 'rgb(8,48,107)',
        width: 1.5
      }
    }
  }];
  var monthWoChartLayOut = {
    title: 'WORK ORDER RECEPTION TIME'
  };
  Plotly.newPlot(month_chart_id, monthWoChartData, monthWoChartLayOut);
}

function drawHeatMap(hm_data){
  ///////////////////////////////// prepare station heat map //////////////////////////
  var xValuesHMap = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  var yValuesHMap = ['Shop / CCS', 'PC MC', 'Engineering', 'PC Planning', 'R&S', 'CRM'];

  var zValuesHMap = [];
  var zrow = [];
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 10; j++) {
      //alert(taskMatrix[i][j]);
      var f_task = hm_data.filter(item => item[0].task == taskMatrix[i][j]);
      //alert(JSON.stringify(f_task)+j+i);
      if (f_task.length != 0 && f_task[0][0].task != "") {
        //alert(f_task[0][0].count);
        zrow.push(f_task[0][0].count);
      } else {
        zrow.push("");
      }
    }
    zValuesHMap.push(zrow);
    zrow = [];
  };
  //alert(JSON.stringify(zValuesHMap));
  var colorscaleValue = [
    [0, 'green'],
    [0.25, 'yellow'],
    [0.5, 'orange'],
    [0.75, 'red']
  ];

  var dataHMap = [{
    x: xValuesHMap,
    y: yValuesHMap,
    z: zValuesHMap,
    type: 'heatmap',
    colorscale: colorscaleValue,
    showscale: false
  }];

  var layoutHMap = {
    title: 'Production Planning Heatmap',
    annotations: [],
    xaxis: {
      ticks: '',
      side: 'top'
    },
    yaxis: {
      ticks: '',
      ticksuffix: ' ',
      width: 700,
      height: 700,
      autosize: false
    }
  };
  for (var i = 0; i < yValuesHMap.length; i++) {

    for (var j = 0; j < xValuesHMap.length; j++) {
      var currentValue = zValuesHMap[i][j];
      if (currentValue == "") {
        var textColor = 'white';
      } else {
        var textColor = 'black';
      }
      var result = {
        xref: 'x1',
        yref: 'y1',
        x: xValuesHMap[j],
        y: yValuesHMap[i],
        text: zValuesHMap[i][j] + "<br>" + taskMatrix[i][j],
        font: {
          family: 'Arial',
          size: 6,
          //color: 'rgb(50, 171, 96)'
        },
        showarrow: false,
        font: {
          color: textColor
        }
      };
      layoutHMap.annotations.push(result);
    }
  }

  Plotly.newPlot('staitionHeatMap', dataHMap, layoutHMap);
} 
  