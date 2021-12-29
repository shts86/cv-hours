/*
report id:
1- hours report
3- holiday
4- half holyday
5- resurve duty
6- sickday
*/

const token = JSON.parse(localStorage['TOKEN']).access_token;
const beginOfMonth = moment().startOf('month').format('YYYY-MM-DD');
const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
const beginOfQuarter = moment().startOf('quarter').format('YYYY-MM-DD');
const endOfQuarter = moment().endOf('quarter').format('YYYY-MM-DD');
const fullDayHours = 8.8,
  halfDayHours = 4.4;

//month call
$.ajax({
  type: 'GET',
  url: `https://reportapi.codevalue.net/api/calendardays?fromDate=${beginOfMonth}&toDate=${endOfMonth}&includeEmptyDays=true&includeReports=true`,
  headers: {
    Authorization: 'Bearer ' + token,
  },
  dataType: 'json',
  success: function (result, status, xhr) {
    // console.log(result);
    calculateMonthlyHours(result);
  },
  error: function (xhr, status, error) {
    console.log('CHV EXTENSION - ERROR GET DATA - Massage:');
    console.log(error);
  },
});

//quarter call
$.ajax({
  type: 'GET',
  url: `https://reportapi.codevalue.net/api/calendardays?fromDate=${beginOfQuarter}&toDate=${endOfQuarter}&includeEmptyDays=true&includeReports=true`,
  headers: {
    Authorization: 'Bearer ' + token,
  },
  dataType: 'json',
  success: function (result, status, xhr) {
    // console.log(result);
    calculateQuarterHours(result);
  },
  error: function (xhr, status, error) {
    console.log('CHV EXTENSION - ERROR GET DATA - Massage:');
    console.log(error);
  },
});

function calculateMonthlyHours(data) {
  let totalHours = 0,
    currentHours = 0,
    workingDaysCounter = 0;

  data.forEach(el => {
    // console.log(el);
    el.hourReports
      .filter(r => !!r.startTime && !!r.endTime)
      .forEach(rep => {
        const hours = moment(rep.endTime).diff(
          moment(rep.startTime),
          'hours',
          true
        );
        currentHours += hours;
        // if the user was on day off
        if (
          rep.reportTypeId === 3 ||
          rep.reportTypeId === 5 ||
          rep.reportTypeId === 6
        ) {
          totalHours -= fullDayHours;
        }
        if (rep.reportTypeId === 4) {
          totalHours -= halfDayHours;
        }
      });

    if (el.isRequireReport) {
      workingDaysCounter++;
    }
    if (el.holidayType === 'NoHoliday') {
      totalHours += fullDayHours;
    }
    if (el.holidayType === 'HalfHoliday') {
      totalHours += halfDayHours;
    }
  });

  // console.log(moment().format());
  // console.log('totaHours: ', totalHours, 'currentHours: ', currentHours);
  $('.cvh-current-hours').text(currentHours.toFixed(2));
  $('.cvh-total-hours').text(totalHours.toFixed(2));
  $('.cvh-monthly-hours-left').text((totalHours - currentHours).toFixed(2));
}

function calculateQuarterHours(data) {
  let totalHours = 540,
    currentHours = 0;

  data.forEach(el => {
    // console.log(el);
    el.hourReports
      .filter(r => !!r.startTime && !!r.endTime)
      .forEach(rep => {
        const hours = moment(rep.endTime).diff(
          moment(rep.startTime),
          'hours',
          true
        );
        currentHours += hours;
      });
  });
  $('.cvh-quarter-current-hours').text(currentHours.toFixed(2));
  $('.cvh-quarter-hours-left').text((totalHours - currentHours).toFixed(2));
}

$('.full-height.desktop-main').prepend(
  $(`
  <div class="cvh-wrap">
    <div class="chv-cell">
      <div class="cvh-title">שעות שנעשו החודש:&nbsp;</div>
      <div class="cvh-current-hours"></div>
    </div>
    <div class="chv-cell">
      <div class="cvh-title">דרישה חודשית:&nbsp;</div>
      <div class="cvh-total-hours"></div>
    </div>
    <div class="chv-cell">
      <div class="cvh-title">שעות חודשיות שנשארו:&nbsp;</div>
      <div class="cvh-monthly-hours-left"></div>
    </div>
    <div class="chv-cell">
      <div class="cvh-title">שעות שנעשו הרבעון:&nbsp;</div>
      <div class="cvh-quarter-current-hours"></div>
    </div>
    <div class="chv-cell">
      <div class="cvh-title">שעות רבעוניות שנשארו:&nbsp;</div>
      <div class="cvh-quarter-hours-left"></div>
    </div>
  </div>`)
);
