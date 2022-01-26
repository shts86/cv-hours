/*
report id:
1- hours report
2- general day off - add only by admin
3- holiday
4- half holyday
5- resurve duty
6- sickday
*/

const tokenObj = localStorage['TOKEN'];
const token = tokenObj && JSON.parse(tokenObj).access_token;
const beginOfMonth = moment().startOf('month').format('YYYY-MM-DD');
const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
const beginOfQuarter = moment().startOf('quarter').format('YYYY-MM-DD');
const endOfQuarter = moment().endOf('quarter').format('YYYY-MM-DD');
const fullDayHours = 8.8,
  halfDayHours = fullDayHours / 2;

function hourFormat(time) {
  const dur = moment.duration(time, 'hours');
  const hours = Math.floor(dur.asHours());
  const mins = Math.floor(dur.asMinutes()) - hours * 60;

  return hours + ':' + (mins < 10 ? '0' + mins : mins);
}

//month call
token &&
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
      console.error('CHV EXTENSION - ERROR GET DATA - Massage:', error);
    },
  });

//quarter call
token &&
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
      console.error('CHV EXTENSION - ERROR GET DATA - Massage:', error);
    },
  });

function calculateMonthlyHours(data) {
  let totalRequireHours = 0,
    requireHours = 0,
    currentHours = 0,
    meanHours = 0,
    currentWorkingDays = 0,
    jobPercent = 0,
    totalWorkingDays = 0;

  data.forEach(day => {
    // console.log(el);
    day.hourReports
      .filter(r => !!r.startTime && !!r.endTime)
      .forEach(rep => {
        const hours = moment(rep.endTime).diff(
          // calculate how many hours for this day
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
          currentHours += fullDayHours;
        }
        if (rep.reportTypeId === 4) {
          currentHours += halfDayHours;
        }
        if (rep.reportTypeId === 2) {
          if (day.holidayType === 'NoHoliday') {
            currentHours += fullDayHours;
          }
          if (day.holidayType === 'HalfHoliday') {
            currentHours += halfDayHours;
          }
        }
      });

    if (day.hourReports.length && !moment(day.date).isSame(new Date(), 'day')) {
      // !moment(day.date).isSame(new Date(), "day") = not today
      currentWorkingDays++;
    }

    if (day.isRequireReport) {
      totalWorkingDays++;
    }
    if (day.holidayType === 'NoHoliday') {
      totalRequireHours += fullDayHours;
      if (moment(day.date).isBefore(new Date(), 'day')) {
        requireHours += fullDayHours;
      }
    }
    if (day.holidayType === 'HalfHoliday') {
      totalRequireHours += halfDayHours;
      if (moment(day.date).isBefore(new Date(), 'day')) {
        requireHours += halfDayHours;
      }
    }
  });

  meanHours =
    (totalRequireHours - currentHours) /
    (totalWorkingDays - currentWorkingDays);
  jobPercent = (currentHours / requireHours) * 100;

  // console.log('todayRequireHours: ', requireHours);
  // console.log('totalRequireHours: ', totalRequireHours);
  // console.log('currentHours: ', currentHours);
  $('.cvh-current-hours').text(hourFormat(currentHours));
  $('.cvh-mean-hours').text(hourFormat(meanHours));
  $('.cvh-total-hours').text(hourFormat(totalRequireHours));
  // $('.cvh-current-hours').text(currentHours.toFixed(2));
  // $('.cvh-mean-hours').text(meanHours.toFixed(2));
  // $('.cvh-total-hours').text(totalRequireHours.toFixed(2));
  $('.cvh-monthly-job-percent').text(jobPercent.toFixed(0) + '%');
}

function calculateQuarterHours(month) {
  let totalRequireHours = 0,
    requireHours = 0,
    bonus = 540,
    bonusHours = 0,
    currentHours = 0;
  (meanHours = 0), (currentWorkingDays = 0);
  totalWorkingDays = 0;

  month.forEach(day => {
    // console.log(el);
    day.hourReports
      .filter(r => !!r.startTime && !!r.endTime)
      .forEach(rep => {
        const hours = moment(rep.endTime).diff(
          moment(rep.startTime),
          'hours',
          true
        );
        currentHours += hours;
      });

    if (day.hourReports.length && !moment(day.date).isSame(new Date(), 'day')) {
      // !moment(day.date).isSame(new Date(), "day") = not today
      currentWorkingDays++;
    }

    if (day.isRequireReport) {
      totalWorkingDays++;
    }
    if (day.holidayType === 'NoHoliday') {
      totalRequireHours += fullDayHours;
      if (moment(day.date).isBefore(new Date(), 'day')) {
        requireHours += fullDayHours;
      }
    }
    if (day.holidayType === 'HalfHoliday') {
      totalRequireHours += halfDayHours;
      if (moment(day.date).isBefore(new Date(), 'day')) {
        requireHours += halfDayHours;
      }
    }
  });

  bonusHours = Math.min(bonus, totalRequireHours);
  meanHours =
    (bonusHours - currentHours) / (totalWorkingDays - currentWorkingDays);
  jobPercent = (currentHours / requireHours) * 100;

  $('.cvh-quarter-total-hours').text(hourFormat(bonusHours));
  $('.cvh-quarter-current-hours').text(hourFormat(currentHours));
  $('.cvh-quarter-mean-hours').text(hourFormat(meanHours));
  // $('.cvh-quarter-total-hours').text(bonusHours.toFixed(2));
  // $('.cvh-quarter-current-hours').text(currentHours.toFixed(2));
  // $('.cvh-quarter-mean-hours').text(meanHours.toFixed(2));
  // // $('.cvh-quarter-job-percent').text(jobPercent.toFixed(2));
}

$('.full-height.desktop-main').prepend(
  $(`
  <div class="cvh-wrap">
    <div class="cvh-wrap month-bg">
    <div class="chv-cell">
      <div class="cvh-title">דרישה חודשית:&nbsp;</div>
      <div class="cvh-total-hours"></div>
    </div>
      <div class="chv-cell">
        <div class="cvh-title">שעות שנעשו החודש:&nbsp;</div>
        <div class="cvh-current-hours"></div>
      </div>
      <div class="chv-cell">
        <div class="cvh-title">ממוצע יומי חודשי דרוש:&nbsp;</div>
        <div class="cvh-mean-hours"></div>
      </div>
      <div class="chv-cell">
        <div class="cvh-title">אחוז משרה כרגע:&nbsp;</div>
        <div class="cvh-monthly-job-percent"></div>
      </div>
    </div>
    <div class="cvh-wrap quarter-bg">
    <div class="chv-cell">
      <div class="cvh-title">דרישה רבעונית:&nbsp;</div>
      <div class="cvh-quarter-total-hours"></div>
    </div>
      <div class="chv-cell">
        <div class="cvh-title">שעות שנעשו הרבעון:&nbsp;</div>
        <div class="cvh-quarter-current-hours"></div>
      </div>
      <div class="chv-cell">
        <div class="cvh-title">ממוצע יומי רבעוני דרוש:&nbsp;</div>
        <div class="cvh-quarter-mean-hours"></div>
      </div>
    </div>
  </div>`)
);
