# Boiled Page date selector script

A simple, lightweight and customizable date selector JavaScript module for Boiled Page frontend framework that can be used to select date and time trough select form elements. You can define one or more available and excluded date intervals, set time increments.

## Install

Place `date-selector.js` to `/assets/js` directory and add its path to `scripts` variable in `gulpfile.js` to be combined with other scripts. You will also need to add form component to make select form elements working properly.

- Form component: <https://www.github.com/abelbrencsan/boiled-page-form-component>

## Usage

To create a new date selector instance, call `DateSelector` constructor the following way:

```js
// Create new date selector instance
var dateSelector = new DateSelector(options);

// Initialize date selector instance
dateSelector.init();
```

## Options

Available options for date selector constructor:

Option| Type | Default | Required | Description
------|------|---------|----------|------------
`year` | Object | null | Yes | Object that defines a select form element and behavior of year options.
`month` | Object | null | Yes | Object that defines a select form element and behavior of month options.
`day` | Object | null | Yes | Object that defines a select form element and behavior of day options.
`hour` | Object | null | No | Object that defines a select form element and behavior of hour options.
`minute` | Object | null | No | Object that defines a select form element and behavior of minute options.
`time` | Object | null | No | Object that defines a select form element and behavior of time options (minutes elapsed from midnight). Leave it empty if you want to use hour and minute based time selection.
`intervals` | Array | An interval item from now to 1 year added to current date. | No | Array of date intervals. `from` and `to` properties must be defined for each interval.
`excludedDates` | Array | [] | No | Array of excluded date intervals. `from` and `to` properties must be defined for each excluded date.
`minuteStep` | Number | 1 | No | Number of minutes that defines time increment.
`selectableMinutes` | Number | 1 | No | Minutes substracted from last available time in an interval.
`isSilentMode` | Boolean | false | No | Prevent console errors to be shown.
`dateIsSelectedCallback` | Function | null | No | Callback function after date is selected.
`dateIsDeselectedCallback` | Function | null | No | Callback function after date is deselected.
`initCallback` | Function | null | No | Callback function after date selector is initialized.
`selectYearCallback` | Function | null | No | Callback function after year is selected.
`selectMonthCallback` | Function | null | No | Callback function after month is selected.
`selectDayCallback` | Function | null | No | Callback function after day is selected.
`selectHourCallback` | Function | null | No | Callback function after hour is selected.
`selectMinuteCallback` | Function | null | No | Callback function after minute is selected.
`selectTimeCallback` | Function | null | No | Callback function after time is selected.
`destroyCallback` | Function | null | No | Callback function after date selector is destroyed.

Available options for `year` object:

Option| Type | Default | Required | Description
------|------|---------|----------|------------
`selector` | Object | null | Yes | A select form element where available year options will be appended.
`hideDisabledOptions` | Boolean | false | No | Prevent excluded years to append as an option, or set them as disabled.
`renderLabel` | Function | A 4-digits representation of year. | No | Function to define how a year option is displayed. It gets year as an argument.

Available options for `month` object:

Option| Type | Default | Required | Description
------|------|---------|----------|------------
`selector` | Object | null | Yes | A select form element where available month options will be appended.
`hideDisabledOptions` | Boolean | false | No | Prevent excluded months to append as an option, or set them as disabled.
`renderLabel` | Function | A numeric representation of month without leading zeros. | No | Function to define how a month option is displayed. It gets month as an argument.

Available options for `day` object:

Option| Type | Default | Required | Description
------|------|---------|----------|------------
`selector` | Object | null | Yes | A select form element where available day options will be appended.
`hideDisabledOptions` | Boolean | false | No | Prevent excluded days to append as an option, or set them as disabled.
`renderLabel` | Function | A numeric representation of day without leading zeros. | No | Function to define how a day option is displayed. It gets day as an argument.

Available options for `hour` object:

Option| Type | Default | Required | Description
------|------|---------|----------|------------
`selector` | Object | null | Yes | A select form element where available hour options will be appended.
`hideDisabledOptions` | Boolean | false | No | Prevent excluded hours to append as an option, or set them as disabled.
`renderLabel` | Function | A numeric representation of hour with leading zeros. | No | Function to define how an hour option is displayed.It gets hour as an argument.

Available options for `minute` object:

Option| Type | Default | Required | Description
------|------|---------|----------|------------
`selector` | Object | null | Yes | A select form element where available minute options will be appended.
`hideDisabledOptions` | Boolean | false | No | Prevent excluded minutes to append as an option, or set them as disabled.
`renderLabel` | Function | A numeric representation of minute with leading zeros. | No | Function to define how a minute option is displayed. It gets minute as an argument.

Available options for `time` object:

Option| Type | Default | Required | Description
------|------|---------|----------|------------
`selector` | Object | null | Yes | A select form element where available time options will be appended.
`renderLabel` | Function | Number of minutes elapsed from midnight | No | Function to define how a time option is displayed. It gets time as an argument.

Available options for an interval item object:

Option| Type | Required | Description
------|------|----------|------------
`from` | Object | Yes | A date object when interval is available from.
`to` | Object | Yes | A date object when interval is available to.

Available options for an excluded interval item object:

Option| Type | Required | Description
------|------|----------|------------
`from` | Object | Yes | A date object when interval is excluded from.
`to` | Object | Yes | A date object when interval is excluded to.

## Methods

### Initialize date selector

`init()` - Initialize date selector. It adds related events, calculate available intervals.

### Select year

`selectYear(year)` - Select given year, and set available months.

Parameter | Type | Required | Description
----------|------|----------|------------
`year` | Number | Yes | Year to be selected.

### Select month

`selectMonth(month)` - Select given month, and set available days.

Parameter | Type | Required | Description
----------|------|----------|------------
`month` | Number | Yes | Month to be selected.

### Select day

`selectDay(day)` - Select given day, and set available hours (when hour and minute based time selection is used).

Parameter | Type | Required | Description
----------|------|----------|------------
`day` | Number | Yes | Day to be selected.

### Select hour

`selectHour(hour)` - Select given hour, and set available minutes.

Parameter | Type | Required | Description
----------|------|----------|------------
`hour` | Number | Yes | Hour to be selected.

### Select minute

`selectMinute(minute)` - Select given minute.

Parameter | Type | Required | Description
----------|------|----------|------------
`minute` | Number | Yes | Minute to selected.

### Select time

`selectTime(time)` - Select time (available when `time` option is given).

Parameter | Type | Required | Description
----------|------|----------|------------
`time` | Number | Yes | Minutes elapsed from midnight to be selected.

### Select date and time by given timestamp

`selectByTimestamp(timestamp)` - Select date and time by given timestamp.

Parameter | Type | Required | Description
----------|------|----------|------------
`timestamp` | Number | Yes | Timestamp to be selected.

### Destroy date selector

`destroy()` - Destroy date selector. It removes all related events.

### Check date selector is initialized or not

`getIsInitialized()` - Check date selector is initialized or not. It returns `true` when it is already initialized, `false` if not.

### Get selected date

`getSelectedDate()` - Get selected date of date selector.

### Check date is selected or not

`getIsDateSelected()` - Check date is selected or not. It returns `true` when a date completely selected, `false` if not.

### Get available intervals

`getAvailableIntervals()` - Get available intervals calculated from intervals and excluded dates.

## Examples

### Example 1

The following example shows a date selector with hour and minute based time selection.

```html
<span class="form-label">Select date, hour and time</span>
<ul class="form-group-list grid grid--bottom" data-date-selector>
  <li class="form-group-list-item grid-col grid-col--fit">
    <div class="form-item">
      <label class="is-visually-hidden" for="dateSelectorYear">Year</label>
      <select name="dateSelectorYear" id="dateSelectorYear" class="form-input form-input--select" disabled>
        <option>Y</option>
      </select>
    </div>
  </li>
  <li class="form-group-list-item grid-col grid-col--fit">
    <div class="form-item">
      <label class="is-visually-hidden" for="dateSelectorMonth">Month</label>
      <select name="dateSelectorMonth" id="dateSelectorMonth" class="form-input form-input--select" disabled>
        <option>M</option>
      </select>
    </div>
  </li>
  <li class="form-group-list-item grid-col grid-col--fit">
    <div class="form-item">
      <label class="is-visually-hidden" for="dateSelectorDay">Day</label>
      <select name="dateSelectorDay" id="dateSelectorDay" class="form-input form-input--select" disabled>
        <option>D</option>
      </select>
    </div>
  </li>
  <li class="form-group-list-item grid-col grid-col--fit">
    <div class="form-item">
      <label class="form-label is-visually-hidden" for="dateSelectorHour">Hour</label>
      <select name="dateSelectorHour" id="dateSelectorHour" class="form-input form-input--select" disabled>
        <option>H</option>
      </select>
    </div>
  </li>
  <li class="form-group-list-item grid-col grid-col--fit">
    <div class="form-item">
      <label class="form-label is-visually-hidden" for="dateSelectorMinute">Minute</label>
      <select name="dateSelectorMinute" id="dateSelectorMinute" class="form-input form-input--select" disabled>
        <option>M</option>
      </select>
    </div>
  </li>
</ul>
```

Place the following code inside `assets/js/app.js` to initialize date selector.

```js
var dateSelector = new DateSelector({
  year: {
    selector: document.getElementById('dateSelectorYear')
  },
  month: {
    selector: document.getElementById('dateSelectorMonth')
  },
  day: {
    selector: document.getElementById('dateSelectorDay')
  },
  hour: {
    selector: document.getElementById('dateSelectorHour')
  },
  minute: {
    selector: document.getElementById('dateSelectorMinute')
  },
  minuteStep: 15,
  selectableMinutes: 15,
  intervals: [
    {
      from: new Date(2020, 0),
      to: new Date(2021, 6)
    }
  ],
  excludedDates: [
    {
      from: new Date(2020, 2, 10),
      to: new Date(2020, 2, 15)
    }
  ]
});
dateSelector.init();
```

### Example 2

The following example shows a date selector with time selection based on minutes elapsed from midnight.

```html
<span class="form-label">Select date, hour and time</span>
<ul class="form-group-list grid grid--bottom" data-date-selector>
  <li class="form-group-list-item grid-col grid-col--fit">
    <div class="form-item">
      <label class="is-visually-hidden" for="dateSelector2Year">Year</label>
      <select name="dateSelector2Year" id="dateSelector2Year" class="form-input form-input--select" disabled>
        <option>Y</option>
      </select>
    </div>
  </li>
  <li class="form-group-list-item grid-col grid-col--fit">
    <div class="form-item">
      <label class="is-visually-hidden" for="dateSelector2Month">Month</label>
      <select name="dateSelector2Month" id="dateSelector2Month" class="form-input form-input--select" disabled>
        <option>M</option>
      </select>
    </div>
  </li>
  <li class="form-group-list-item grid-col grid-col--fit">
    <div class="form-item">
      <label class="is-visually-hidden" for="dateSelector2Day">Day</label>
      <select name="dateSelector2Day" id="dateSelector2Day" class="form-input form-input--select" disabled>
        <option>D</option>
      </select>
    </div>
  </li>
  <li class="form-group-list-item grid-col grid-col--fit">
    <div class="form-item">
      <label class="form-label is-visually-hidden" for="dateSelector2Time">Time</label>
      <select name="dateSelector2Time" id="dateSelector2Time" class="form-input form-input--select" disabled>
        <option>T</option>
      </select>
    </div>
  </li>
</ul>
```

Place the following code inside `assets/js/app.js` to initialize date selector.

```js
var dateSelector2 = new DateSelector({
  year: {
    selector: document.getElementById('dateSelector2Year')
  },
  month: {
    selector: document.getElementById('dateSelector2Month')
  },
  day: {
    selector: document.getElementById('dateSelector2Day')
  },
  time: {
    selector: document.getElementById('dateSelector2Time'),
    renderLabel: function(time) {
      var hour = Math.floor(time / 60);
      var minute = time % 60;
      if (hour < 10) {
        hour = '0' + hour;
      }
      if (minute < 10) {
        minute = '0' + minute;
      }
      return hour + ':' + minute;
    }
  },
  minuteStep: 30,
  selectableMinutes: 30,
  intervals: [
    {
      from: new Date(2020, 0),
      to: new Date(2021, 6)
    }
  ],
  excludedDates: [
    {
      from: new Date(2020, 2, 10),
      to: new Date(2020, 2, 15)
    }
  ]
});
dateSelector2.init();
```
