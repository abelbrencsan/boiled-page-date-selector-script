/**
 * Date selector - v1.0.3
 * Copyright 2020 Abel Brencsan
 * Released under the MIT License
 */

var DateSelector = function(options) {

	'use strict';

	// Test required options
	if (typeof options.year !== 'object' || typeof options.year.selector !== 'object') throw 'Date Selector "yearSelector" option must be an object';
	if (typeof options.month !== 'object' || typeof options.month.selector !== 'object') throw 'Date Selector "monthSelector" option must be an object';
	if (typeof options.day !== 'object' || typeof options.day.selector !== 'object') throw 'Date Selector "daySelector" option must be an object';

	// Get current date
	var currentDate = new Date();

	// Available date part keys
	var dateParts = ['year', 'month', 'day', 'hour', 'minute', 'time'];

	// Default date selector instance options
	var defaults = {
		year: {
			selector: null,
			hideDisabledOptions: false,
			renderLabel: function(year) {
				return year;
			}
		},
		month: {
			selector: null,
			hideDisabledOptions: false,
			renderLabel: function(month) {
				return month + 1;
			}
		},
		day: {
			selector: null,
			hideDisabledOptions: false,
			renderLabel: function(day, weekday) {
				return day;
			}
		},
		hour: {
			selector: null,
			hideDisabledOptions: false,
			renderLabel: function(hour) {
				if (hour < 10) {
					hour = '0' + hour;
				}
				return hour;
			}
		},
		minute: {
			selector: null,
			hideDisabledOptions: false,
			renderLabel: function(minute) {
				if (minute < 10) {
					minute = '0' + minute;
				}
				return minute;
			}
		},
		time: {
			selector: null,
			renderLabel: function(time) {
				return time;
			}
		},
		intervals: [{
			from: currentDate,
			to: new Date(currentDate.getFullYear() + 3, currentDate.getMonth(), currentDate.getDate())
		}],
		excludedDates: [],
		minuteStep: 1,
		selectableMinutes: 1,
		isSilentMode: false,
		dateIsSelectedCallback: null,
		dateIsDeselectedCallback: null,
		initCallback: null,
		selectYearCallback: null,
		selectMonthCallback: null,
		selectDayCallback: null,
		selectHourCallback: null,
		selectMinuteCallback: null,
		selectTimeCallback: null,
		destroyCallback: null
	};

	// Extend date selector instance options with defaults
	for (var key in defaults) {
		if (dateParts.indexOf(key) > -1) {
			this[key] = {};
			this[key]['availableOptions'] = [];
			this[key]['selectedOption'] = null;
			this[key]['initialIndex'] = null;
			this[key]['initialLength'] = null;
			for (var datePartKey in defaults[key]) {
				this[key][datePartKey] = (options[key] && options[key].hasOwnProperty(datePartKey)) ? options[key][datePartKey] : defaults[key][datePartKey];
			}
		}
		else {
			this[key] = (options.hasOwnProperty(key)) ? options[key] : defaults[key];
		}
	}

	// Date selector instance variables
	this.availableIntervals = [];
	this.availableExcludedDates = [];
	this.selectedDate = null;
	this.isDateSelected = false;
	this.isHourAndMinuteEnabled = false;
	this.isTimeEnabled = false;
	this.isInitialized = false;

};

DateSelector.prototype = function () {

	'use strict';

	var dateSelector = {

		daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

		/**
		* Initialize date selector. It adds related events, calculate available intervals. (public)
		*/
		init: function() {
			if (this.isInitialized) return;
			var index = 0;
			this.handleEvent = function(event) {
				dateSelector.handleEvents.call(this, event);
			};
			dateSelector.initDatePart.call(this, this.year);
			dateSelector.initDatePart.call(this, this.month);
			dateSelector.initDatePart.call(this, this.day);
			if (this.hour.selector && this.minute.selector) {
				this.isHourAndMinuteEnabled = true;
				dateSelector.initDatePart.call(this, this.hour);
				dateSelector.initDatePart.call(this, this.minute);
			}
			else if (this.time.selector) {
				this.isTimeEnabled = true;
				dateSelector.initDatePart.call(this, this.time);
			}
			dateSelector.copyIntervals.call(this);
			dateSelector.copyExcludedDates.call(this);
			dateSelector.excludeAvailableIntervals.call(this);
			while (index < this.availableIntervals.length) {
				if (this.availableIntervals[index].times.length) {
					setFirstAvailableDate(this.availableIntervals[index], this.minuteStep, this.selectableMinutes);
					setLastAvailableDate(this.availableIntervals[index], this.minuteStep, this.selectableMinutes);
					if (this.availableIntervals[index].from <= this.availableIntervals[index].to) {
						index++;
					}
					else {
						this.availableIntervals.splice(index, 1);
					}
				}
				else {
					this.availableIntervals.splice(index, 1);
				}
			}
			dateSelector.setAvailableYears.call(this);
			this.isInitialized = true;
			if (this.initCallback) this.initCallback.call(this);
		},

		/**
		* Select given year and set available months. (public)
		* @param year number
		*/
		selectYear: function(year) {
			dateSelector.clearDatePart.call(this, this.month);
			dateSelector.clearDatePart.call(this, this.day);
			if (this.isHourAndMinuteEnabled) {
				this.time.availableOptions = [];
				dateSelector.clearDatePart.call(this, this.hour);
				dateSelector.clearDatePart.call(this, this.minute);
			}
			if (this.isTimeEnabled) {
				dateSelector.clearDatePart.call(this, this.time);
			}
			if (year > 0) {
				if (this.year.availableOptions.indexOf(year) == -1) {
					if (!this.isSilentMode) {
						console.error('"' + year + '" year is not available');
					}
					return this;
				}
				if (this.year.selector.value !== String(year)) {
					this.year.selector.value = year;
				}
				this.year.selectedOption = year;
				this.selectedDate = new Date(this.year.selectedOption, 0);
				dateSelector.setAvailableMonths.call(this);
			}
			else {
				this.year.selectedOption = null;
				this.selectedDate = null;
			}
			if (this.selectYearCallback) this.selectYearCallback.call(this, this.selectedYear, this.selectedDate);
			if (this.isDateSelected) {
				if (this.dateIsDeselectedCallback) this.dateIsDeselectedCallback.call(this);
				this.isDateSelected = false;
			}
			return this;
		},

		/**
		* Select given month and set available days. (public)
		* @param month number
		*/
		selectMonth: function(month) {
			dateSelector.clearDatePart.call(this, this.day);
			if (this.isHourAndMinuteEnabled) {
				this.time.availableOptions = [];
				dateSelector.clearDatePart.call(this, this.hour);
				dateSelector.clearDatePart.call(this, this.minute);
			}
			if (this.isTimeEnabled) {
				dateSelector.clearDatePart.call(this, this.time);
			}
			if (month === 0 || month > 0) {
				if (this.month.availableOptions.indexOf(month) == -1) {
					if (!this.isSilentMode) {
						console.error('"' + month + '" month is not available');
					}
					return this;
				}
				if (this.month.selector.value !== String(month)) {
					this.month.selector.value = month;
				}
				this.month.selectedOption = month;
				this.selectedDate = new Date(this.year.selectedOption, this.month.selectedOption);
				dateSelector.setAvailableDays.call(this);
			}
			else {
				this.month.selectedOption = null;
				this.selectedDate = new Date(this.selectedYear);
			}
			if (this.selectMonthCallback) this.selectMonthCallback.call(this, this.selectedMonth, this.selectedDate);
			if (this.isDateSelected) {
				if (this.dateIsDeselectedCallback) this.dateIsDeselectedCallback.call(this);
				this.isDateSelected = false;
			}
			return this;
		},

		/**
		* Select given day and set available hours or minutes elapsed from midnight when `time` option is given. (public)
		* @param day number
		*/
		selectDay: function(day) {
			var enableDeselection = true;
			if (this.isHourAndMinuteEnabled) {
				this.time.availableOptions = [];
				dateSelector.clearDatePart.call(this, this.hour);
				dateSelector.clearDatePart.call(this, this.minute);
			}
			if (this.isTimeEnabled) {
				dateSelector.clearDatePart.call(this, this.time);
			}
			if (day > 0) {
				if (this.day.availableOptions.indexOf(day) == -1) {
					if (!this.isSilentMode) {
						console.error('"' + day + '" day is not available');
					}
					return this;
				}
				if (this.day.selector.value !== String(day)) {
					this.day.selector.value = day;
				}
				this.day.selectedOption = day;
				this.selectedDate = new Date(this.year.selectedOption, this.month.selectedOption, this.day.selectedOption);
				if (this.isHourAndMinuteEnabled) {
					dateSelector.calculateAvailableTimes.call(this);
					dateSelector.setAvailableHours.call(this);
				}
				else if (this.isTimeEnabled) {
					dateSelector.calculateAvailableTimes.call(this);
					dateSelector.setAvailableTimes.call(this);
				}
				else {
					enableDeselection = false;
					this.isDateSelected = true;
					if (this.dateIsSelectedCallback) this.dateIsSelectedCallback.call(this, this.selectedDate);
				}
			}
			else {
				this.day.selectedOption = null;
				this.selectedDate = new Date(this.year.selectedOption, this.month.selectedOption);
			}
			if (this.selectDayCallback) this.selectDayCallback.call(this, this.selectedDay, this.selectedDate);
			if (this.isDateSelected && enableDeselection) {
				if (this.dateIsDeselectedCallback) this.dateIsDeselectedCallback.call(this);
				this.isDateSelected = false;
			}
			return this;
		},

		/**
		* Select given hour and set available minutes. (public)
		* @param hour number
		*/
		selectHour: function(hour) {
			if (!this.isHourAndMinuteEnabled) {
				if (!this.isSilentMode) {
					console.error('Hour selection is not available');
				}
				return this;
			}
			dateSelector.clearDatePart.call(this, this.minute);
			if (hour === 0 || hour > 0) {
				if (this.hour.availableOptions.indexOf(hour) == -1) {
					if (!this.isSilentMode) {
						console.error('"' + hour + '" hour is not available');
					}
					return this;
				}
				if (this.hour.selector.value !== String(hour)) {
					this.hour.selector.value = hour;
				}
				this.hour.selectedOption = hour;
				this.selectedDate = new Date(this.year.selectedOption, this.month.selectedOption, this.day.selectedOption, this.hour.selectedOption);
				dateSelector.setAvailableMinutes.call(this);
			}
			else {
				this.hour.selectedOption = null;
				this.selectedDate = new Date(this.year.selectedOption, this.month.selectedOption, this.day.selectedOption);
			}
			if (this.selectHourCallback) this.selectHourCallback.call(this, this.selectedHour, this.selectedDate);
			if (this.isDateSelected) {
				if (this.dateIsDeselectedCallback) this.dateIsDeselectedCallback.call(this);
				this.isDateSelected = false;
			}
			return this;
		},

		/**
		* Select given minute. (public)
		* @param minute number
		*/
		selectMinute: function(minute) {
			var enableDeselection = true;
			if (!this.isHourAndMinuteEnabled) {
				if (!this.isSilentMode) {
					console.error('Minute selection is not available');
				}
				return this;
			}
			if (minute === 0 || minute > 0) {
				if (this.minute.availableOptions.indexOf(minute) == -1) {
					if (!this.isSilentMode) {
						console.error('"' + minute + '" minute is not available');
					}
					return this;
				}
				if (this.minute.selector.value !== String(minute)) {
					this.minute.selector.value = minute;
				}
				enableDeselection = false;
				this.minute.selectedOption = minute;
				this.selectedDate = new Date(this.year.selectedOption, this.month.selectedOption, this.day.selectedOption, this.hour.selectedOption, this.minute.selectedOption);
				this.isDateSelected = true;
				if (this.dateIsSelectedCallback) this.dateIsSelectedCallback.call(this, this.selectedDate);
			}
			else {
				this.minute.selectedOption = null;
				this.selectedDate = new Date(this.year.selectedOption, this.month.selectedOption, this.day.selectedOption, this.hour.selectedOption);
			}
			if (this.selectMinuteCallback) this.selectMinuteCallback.call(this, this.selectedMinute, this.selectedDate);
			if (this.isDateSelected && enableDeselection) {
				if (this.dateIsDeselectedCallback) this.dateIsDeselectedCallback.call(this);
				this.isDateSelected = false;
			}
			return this;
		},

		/**
		* Select elapsed minutes from midnight (available when `time` option is given). (public)
		* @param time number
		*/
		selectTime: function(time) {
			var enableDeselection = true;
			if (!this.isTimeEnabled) {
				if (!this.isSilentMode) {
					console.error('Time selection is not available');
				}
				return this;
			}
			if (time === 0 || time > 0) {
				if (this.time.availableOptions.indexOf(time) == -1) {
					if (!this.isSilentMode) {
						console.error('"' + time + '" time is not available');
					}
					return this;
				}
				if (this.time.selector.value != String(time)) {
					this.time.selector.value = time;
				}
				enableDeselection = false;
				this.time.selectedOption = time;
				this.selectedDate = new Date(this.year.selectedOption, this.month.selectedOption, this.day.selectedOption, 0, this.time.selectedOption);
				this.isDateSelected = true;
				if (this.dateIsSelectedCallback) this.dateIsSelectedCallback.call(this, this.selectedDate);
			}
			else {
				this.time.selectedOption = null;
				this.selectedDate = new Date(this.year.selectedOption, this.month.selectedOption, this.day.selectedOption);
			}
			if (this.selectTimeCallback) this.selectTimeCallback.call(this, this.selectedTime, this.selectedDate);
			if (this.isDateSelected && enableDeselection) {
				if (this.dateIsDeselectedCallback) this.dateIsDeselectedCallback.call(this);
				this.isDateSelected = false;
			}
			return this;
		},

		/**
		* Select date and time by given timestamp. (public)
		* @param timestamp number
		*/
		selectByTimestamp: function(timestamp) {
			var time;
			var timestamp = new Date(timestamp);
			dateSelector.selectYear.call(this, timestamp.getFullYear());
			dateSelector.selectMonth.call(this, timestamp.getMonth());
			dateSelector.selectDay.call(this, timestamp.getDate());
			if (this.isHourAndMinuteEnabled) {
				dateSelector.selectHour.call(this, timestamp.getHours());
				dateSelector.selectMinute.call(this, timestamp.getMinutes());
			}
			else if (this.isTimeEnabled) {
				time = (timestamp.getHours() * 60) + timestamp.getMinutes();
				dateSelector.selectTime.call(this, time);
			}
			return this;
		},

		/**
		* Find available years, set them as options. (private)
		*/
		setAvailableYears: function() {
			var option, intervalFrom, intervalTo;
			for (var i = 0; i < this.availableIntervals.length; i++) {
				intervalFrom = new Date(this.availableIntervals[i].from.getTime());
				intervalTo = new Date(this.availableIntervals[i].to.getTime());
				if (intervalTo.getHours() == 0 && intervalTo.getMinutes() == 0) {
					intervalTo.setMinutes(-1);
				}
				for (var year = intervalFrom.getFullYear(); year <= intervalTo.getFullYear(); year++) {
					if (this.year.availableOptions.indexOf(year) == -1) {
						this.year.availableOptions.push(year);
					}
				}
			}
			if (this.year.availableOptions.length) {
				this.year.availableOptions.sort(function(a, b) { return a - b });
				for (var i = this.year.availableOptions[0]; i <= this.year.availableOptions[this.year.availableOptions.length - 1]; i++) {
					option = new Option(this.year.renderLabel.call(this, i), i);
					if (this.year.availableOptions.indexOf(i) == -1) {
						option.setAttribute(this.year.hideDisabledOptions ? 'hidden' : 'disabled', true);
					}
					this.year.selector.add(option);
				}
				this.year.selector.removeAttribute('disabled');
			}
		},

		/**
		* Find available months, set them as options. (private)
		*/
		setAvailableMonths: function() {
			var option, intervalFrom, intervalTo, minDate, maxDate, minMonth, maxMonth;
			for (var i = 0; i < this.availableIntervals.length; i++) {
				intervalFrom = new Date(this.availableIntervals[i].from.getTime());
				intervalTo = new Date(this.availableIntervals[i].to.getTime());
				if (intervalTo.getHours() == 0 && intervalTo.getMinutes() == 0) {
					intervalTo.setMinutes(-1);
				}
				minDate = new Date(intervalFrom.getFullYear(), 0);
				maxDate = new Date(intervalTo.getFullYear(), 0);
				if (minDate <= this.selectedDate && maxDate >= this.selectedDate) {
					minMonth = 0;
					maxMonth = 11;
					if (this.selectedDate.getTime() == minDate.getTime()) {
						minMonth = intervalFrom.getMonth();
					}
					if (this.selectedDate.getTime() == maxDate.getTime()) {
						maxMonth = intervalTo.getMonth();
					}
					for (var month = minMonth; month <= maxMonth; month++) {
						if (this.month.availableOptions.indexOf(month) == -1) {
							this.month.availableOptions.push(month);
						}
					}
				}
			}
			if (this.month.availableOptions.length) {
				for (var i = this.month.availableOptions[0]; i <= this.month.availableOptions[this.month.availableOptions.length - 1]; i++) {
					option = new Option(this.month.renderLabel.call(this, i), i);
					if (this.month.availableOptions.indexOf(i) == -1) {
						option.setAttribute(this.month.hideDisabledOptions ? 'hidden' : 'disabled', true);
					}
					this.month.selector.add(option);
				}
				this.month.selector.removeAttribute('disabled');
			}
		},

		/**
		* Find available days, set them as options. (private)
		*/
		setAvailableDays: function() {
			var option, intervalFrom, intervalTo, minDate, maxDate, minDay, maxDay, weekday;
			for (var i = 0; i < this.availableIntervals.length; i++) {
				if (this.availableIntervals[i].from != null && this.availableIntervals[i].to != null) {
					intervalFrom = new Date(this.availableIntervals[i].from.getTime());
					intervalTo = new Date(this.availableIntervals[i].to.getTime());
					if (intervalTo.getHours() == 0 && intervalTo.getMinutes() == 0) {
						intervalTo.setMinutes(-1);
					}
					minDate = new Date(intervalFrom.getFullYear(), intervalFrom.getMonth());
					maxDate = new Date(intervalTo.getFullYear(), intervalTo.getMonth());
					if (minDate <= this.selectedDate && maxDate >= this.selectedDate) {
						minDay = 1;
						maxDay = dateSelector.daysInMonth[this.month.selectedOption];
						if (this.month.selectedOption == 1) {
							if((this.year.selectedOption % 4 == 0 && this.year.selectedOption % 100 != 0) || this.year.selectedOption % 400 == 0) {
								maxDay = 29;
							}
						}
						if (this.selectedDate.getTime() == minDate.getTime()) {
							minDay = intervalFrom.getDate();
						}
						if (this.selectedDate.getTime() == maxDate.getTime()) {
							maxDay = intervalTo.getDate();
						}
						weekday = new Date(this.year.selectedOption, this.month.selectedOption, minDay).getDay();
						for (var day = minDay; day <= maxDay; day++) {
							if (this.day.availableOptions.indexOf(day) == -1 && this.availableIntervals[i].weekdays.indexOf(weekday) > -1) {
								this.day.availableOptions.push(day);
							}
							weekday++;
							if (weekday > 6) {
								weekday = 0;
							}
						}
					}
				}
			}
			if (this.day.availableOptions.length) {
				this.day.availableOptions.sort(function(a,b) { return a - b } );
				weekday = new Date(this.year.selectedOption, this.month.selectedOption, this.day.availableOptions[0]).getDay();
				for (var i = this.day.availableOptions[0]; i <= this.day.availableOptions[this.day.availableOptions.length - 1]; i++) {
					option = new Option(this.day.renderLabel.call(this, i, weekday), i);
					if (this.day.availableOptions.indexOf(i) == -1) {
						option.setAttribute(this.day.hideDisabledOptions ? 'hidden' : 'disabled', true);
					}
					this.day.selector.add(option);
					weekday++;
					if (weekday > 6) {
						weekday = 0;
					}
				}
				this.day.selector.removeAttribute('disabled');
			}
		},

		/**
		* Find hours from available times, set them as options. (private)
		*/
		setAvailableHours: function() {
			var option, hour;
			for (var i = 0; i < this.time.availableOptions.length; i++) {
				hour = Math.floor(this.time.availableOptions[i] / 60);
				if (this.hour.availableOptions.indexOf(hour) == -1) {
					this.hour.availableOptions.push(hour);
				}
			}
			if (this.hour.availableOptions.length) {
				for (var i = this.hour.availableOptions[0]; i <= this.hour.availableOptions[this.hour.availableOptions.length - 1]; i++) {
					option = new Option(this.hour.renderLabel.call(this, i), i);
					if (this.hour.availableOptions.indexOf(i) == -1) {
						option.setAttribute(this.hour.hideDisabledOptions ? 'hidden' : 'disabled', true);
					}
					this.hour.selector.add(option);
				}
				this.hour.selector.removeAttribute('disabled');
			}
		},

		/**
		* Find minutes from available times, set them as options. (private)
		*/
		setAvailableMinutes: function() {
			var option, hour, minute;
			for (var i = 0; i < this.time.availableOptions.length; i++) {
				hour = Math.floor(this.time.availableOptions[i] / 60);
				minute = Math.floor(this.time.availableOptions[i] % 60);
				if (hour == this.hour.selectedOption && this.minute.availableOptions.indexOf(minute) == -1) {
					this.minute.availableOptions.push(minute);
				}
			}
			if (this.minute.availableOptions.length) {
				for (var i = this.minute.availableOptions[0]; i <= this.minute.availableOptions[this.minute.availableOptions.length - 1]; i += this.minuteStep) {
					option = new Option(this.minute.renderLabel.call(this, i), i);
					if (this.minute.availableOptions.indexOf(i) == -1) {
						option.setAttribute(this.minute.hideDisabledOptions ? 'hidden' : 'disabled', true);
					}
					this.minute.selector.add(option);
				}
				this.minute.selector.removeAttribute('disabled');
			}
		},

		/**
		* Find available times. (private)
		*/
		setAvailableTimes: function() {
			var option;
			if (this.time.availableOptions.length) {
				for (var i = 0; i < this.time.availableOptions.length; i ++) {
					option = new Option(this.time.renderLabel.call(this, this.time.availableOptions[i]), this.time.availableOptions[i]);
					this.time.selector.add(option);
				}
				this.time.selector.removeAttribute('disabled');
			}
		},

		/**
		* Calculate available minutes of selected year, month and day. (private)
		*/
		calculateAvailableTimes: function() {
			var minDate, maxDate, minMinutes, maxMinutes;
			var availableRanges = [];
			for (var i = 0; i < this.availableIntervals.length; i++) {
				if (this.availableIntervals[i].weekdays.indexOf(this.selectedDate.getDay()) > -1) {
					minDate = new Date(this.availableIntervals[i].from.getFullYear(), this.availableIntervals[i].from.getMonth(), this.availableIntervals[i].from.getDate());
					maxDate = new Date(this.availableIntervals[i].to.getFullYear(), this.availableIntervals[i].to.getMonth(), this.availableIntervals[i].to.getDate());
					if (minDate <= this.selectedDate && maxDate >= this.selectedDate) {
						minMinutes = 0;
						maxMinutes = 1440;
						if (minDate.getTime() == this.selectedDate.getTime()) {
							minMinutes = (this.availableIntervals[i].from.getHours() * 60) + this.availableIntervals[i].from.getMinutes();
						}
						if (maxDate.getTime() == this.selectedDate.getTime()) {
							maxMinutes = (this.availableIntervals[i].to.getHours() * 60) + this.availableIntervals[i].to.getMinutes();
						}
						for (var j = 0; j < this.availableIntervals[i].times.length; j++) {
							for (var k = this.availableIntervals[i].times[j].from; k + this.selectableMinutes <= this.availableIntervals[i].times[j].to; k += this.minuteStep) {
								if (k >= minMinutes && k <= maxMinutes - this.selectableMinutes) {
									this.time.availableOptions.push(k);
								}
							}
						}
					}
				}
			}
		},

		/**
		* Initialize given date part. (private)
		* @param datePart object
		*/
		initDatePart: function(datePart) {
			datePart.selector.addEventListener('change', this);
			datePart.selector.setAttribute('disabled', true);
			datePart.initialIndex = datePart.selector.selectedIndex;
			datePart.initialLength = datePart.selector.length;
		},

		/**
		* Destroy given date part. (private)
		* @param datePart object
		*/
		destroyDatePart: function(datePart) {
			datePart.selector.removeEventListener('change', this);
			dateSelector.clearDatePart.call(this, datePart);
			datePart.initialIndex = null;
			datePart.initialLength = null;
		},

		/**
		* Remove dynamically added options from select, set initial index. (private)
		* @param datePart object
		*/
		clearDatePart: function(datePart) {
			datePart.availableOptions = [];
			datePart.selectedOption = null;
			datePart.selector.setAttribute('disabled', true);
			while (datePart.selector.length > datePart.initialLength) {
				datePart.selector.remove(datePart.initialLength);
			}
			datePart.selector.selectedIndex = datePart.initialIndex;
		},

		/**
		* Copy initial intervals to available ones. (private)
		*/
		copyIntervals: function() {
			var times;
			for (var i = 0; i < this.intervals.length; i++) {
				times = [];
				if (this.intervals[i].times) {
					for (var j = 0; j < this.intervals[i].times.length; j++) {
						times.push({
							from: this.intervals[i].times[j].from,
							to: this.intervals[i].times[j].to
						});
					}
				}
				this.availableIntervals.push({
					from: new Date(this.intervals[i].from.getTime()),
					to: new Date(this.intervals[i].to.getTime()),
					weekdays: this.intervals[i].weekdays ? this.intervals[i].weekdays.slice(0) : [0,1,2,3,4,5,6],
					times: times.length ? times : [{ from: [0,0], to: [24,0] }]
				});
				convertTimesToMinutes(this.availableIntervals[i].times, this.minuteStep, this.selectableMinutes);
			}
		},

		/**
		* Copy initial excluded dates to available ones. (private)
		*/
		copyExcludedDates: function() {
			for (var i = 0; i < this.excludedDates.length; i++) {
				this.availableExcludedDates.push({
					from: new Date(this.excludedDates[i].from.getTime()),
					to: new Date(this.excludedDates[i].to.getTime())
				});
			}
			mergeRanges(this.availableExcludedDates);
		},

		/**
		* Substract excluded dates from available intervals. (private)
		*/
		excludeAvailableIntervals: function() {
			var hasWeekdayIntersection = [];
			var excludedWeekdays = [];
			var index = 0;
			while (index < this.availableIntervals.length) {
				for (var j = 0; j < this.availableExcludedDates.length; j++) {
					excludedWeekdays = [this.availableExcludedDates[j].to.getDay()];
					for (var k = this.availableExcludedDates[j].from.getDay(); k !== this.availableExcludedDates[j].to.getDay(); k++) {
						excludedWeekdays.push(k);
						if (k == 6) {
							k = -1;
						}
					}
					if (this.availableExcludedDates[j].to > this.availableIntervals[index].from && this.availableExcludedDates[j].from < this.availableIntervals[index].to) {
						hasWeekdayIntersection = false;
						for (var k = 0; k < excludedWeekdays.length; k++) {
							if (this.availableIntervals[index].weekdays.indexOf(excludedWeekdays[k]) > -1) {
								hasWeekdayIntersection = true;
								break;
							}
						}
						if (hasWeekdayIntersection) {
							if (this.availableExcludedDates[j].from <= this.availableIntervals[index].from && this.availableExcludedDates[j].to >= this.availableIntervals[index].to) {
								this.availableIntervals.splice(index, 1);
							}
							else if (this.availableExcludedDates[j].from <= this.availableIntervals[index].from) {
								this.availableIntervals[index].from = this.availableExcludedDates[j].to;
							}
							else if (this.availableExcludedDates[j].to >= this.availableIntervals[index].to) {
								this.availableIntervals[index].to = this.availableExcludedDates[j].from;
							}
							else {
								this.availableIntervals.push({
									from: new Date(this.availableIntervals[index].from.getTime()),
									to: new Date(this.availableExcludedDates[j].from.getTime()),
									weekdays: this.availableIntervals[index].weekdays,
									times: this.availableIntervals[index].times,
								});
								this.availableIntervals.push({
									from: new Date(this.availableExcludedDates[j].to.getTime()),
									to: new Date(this.availableIntervals[index].to.getTime()),
									weekdays: this.availableIntervals[index].weekdays,
									times: this.availableIntervals[index].times,
								});
								this.availableIntervals.splice(index, 1);
							}
						}
					}
				}
				index++;
			}
		},

		/**
		* Handle events. (private)
		* @param event object
		* On year selector change: select given year and set available months.
		* On month selector change: select given month and set available days.
		* On day selector change: select given day and set available hours or times.
		* On hour selector change: select given hour and set available minutes.
		* On minute selector change: select given minute.
		* On time selector change: select given time.
		*/
		handleEvents: function(event) {
			if (event.type == 'change') {
				switch(event.target) {
					case this.year.selector:
						dateSelector.selectYear.call(this, parseInt(event.target.value));
						break;
					case this.month.selector:
						dateSelector.selectMonth.call(this, parseInt(event.target.value));
						break;
					case this.day.selector:
						dateSelector.selectDay.call(this, parseInt(event.target.value));
						break;
					case this.hour.selector:
						dateSelector.selectHour.call(this, parseInt(event.target.value));
						break;
					case this.minute.selector:
						dateSelector.selectMinute.call(this, parseInt(event.target.value));
						break;
					case this.time.selector:
						dateSelector.selectTime.call(this, parseInt(event.target.value));
						break;
				}
			}
		},

		/**
		* Destroy date selector. It removes all related events. (public)
		*/
		destroy: function() {
			if (!this.isInitialized) return;
			dateSelector.destroyDatePart.call(this, this.year);
			dateSelector.destroyDatePart.call(this, this.month);
			dateSelector.destroyDatePart.call(this, this.day);
			if (this.isHourAndMinuteEnabled) {
				dateSelector.destroyDatePart.call(this, this.hour);
				dateSelector.destroyDatePart.call(this, this.minute);
				this.isHourAndMinuteEnabled = false;
			}
			else if (this.isTimeEnabled) {
				dateSelector.destroyDatePart.call(this, this.time);
				this.isTimeEnabled = false;
			}
			this.availableIntervals = [];
			this.availableExcludedDates = [];
			this.selectedDate = null;
			this.isInitialized = false;
			if (this.destroyCallback) this.destroyCallback.call(this);
		},

		/**
		 * Get value of "isInitialized" to check date selector is initialized or not. (public)
		 */
		getIsInitialized: function() {
			return this.isInitialized;
		},

		/**
		 * Get value of "selectedDate" to get selected date. (public)
		 */
		getSelectedDate: function() {
			return this.selectedDate;
		},

		/**
		 * Get value of "isDateSelected" to check date is selected or not. (public)
		 */
		getIsDateSelected: function() {
			return this.isDateSelected;
		},

		/**
		 * Get value of "availableIntervals" to get available intervals. (public)
		 */
		getAvailableIntervals: function() {
			return this.availableIntervals;
		}
	};

	/**
	* Merge each range's `from` and `to` properties together when possible (private)
	* @param ranges array
	*/
	function mergeRanges(ranges) {
		var innerIndex;
		var outerIndex = 0;
		ranges.sort(function(a, b) { return a.from - b.from });
		while (outerIndex < ranges.length) {
			innerIndex = outerIndex + 1;
			while (innerIndex < ranges.length) {
				if (ranges[innerIndex].from <= ranges[outerIndex].to) {
					if (ranges[innerIndex].to >= ranges[outerIndex].to) {
						ranges[outerIndex].to = ranges[innerIndex].to;
					}
					ranges.splice(innerIndex, 1);
				}
				else {
					innerIndex++;
				}
			}
			outerIndex++;
		}
	}

	/**
	* Convert hour and minute based arrays to minutes, merge and round ranges. (private)
	* @param ranges array
	* @param minuteStep number
	*/
	function convertTimesToMinutes(ranges, minuteStep, selectableMinutes) {
		var fromInMinutes, toInMinutes;
		var index = 0;
		for (var i = 0; i < ranges.length; i++) {
			ranges[i].from = (ranges[i].from[0] * 60) + ranges[i].from[1];
			ranges[i].to = (ranges[i].to[0] * 60) + ranges[i].to[1];
		}
		mergeRanges(ranges);
		while (index < ranges.length) {
			fromInMinutes = ranges[index].from;
			toInMinutes = ranges[index].to;
			if (fromInMinutes >= 0 && fromInMinutes < 1440 && toInMinutes > 0 && toInMinutes <= 1440) {
				// if ((toInMinutes - fromInMinutes) % minuteStep) {
				// 	toInMinutes = toInMinutes - ((toInMinutes - fromInMinutes) % minuteStep);
				// }
				if (fromInMinutes + selectableMinutes <= toInMinutes) {
					ranges[index].from = fromInMinutes;
					ranges[index].to = toInMinutes;
					index++;
				}
				else {
					ranges.splice(index, 1);

				}
			}
			else {
				ranges.splice(index, 1);
			}
		}
	}

	/**
	* Set first available date of given interval. (private)
	* @param interval object
	* @param minuteStep number
	*/
	function setFirstAvailableDate(interval, minuteStep, selectableMinutes) {
		var dayOffset, fromInMinutes;
		var isInInterval = false;
		if (interval.weekdays.indexOf(interval.from.getDay()) == -1) {
			dayOffset = getFirstDayOffset(interval.from, interval.weekdays);
			interval.from = new Date(interval.from.getFullYear(), interval.from.getMonth(), interval.from.getDate() + dayOffset, 0, interval.times[0].from);
		}
		else {
			fromInMinutes = (interval.from.getHours() * 60) + interval.from.getMinutes();
			if (interval.from.getSeconds() > 0) {
				fromInMinutes = fromInMinutes + 1;
			}
			for (var i = 0; i < interval.times.length; i++) {
				if (fromInMinutes + selectableMinutes <= interval.times[i].to) {
					if (fromInMinutes > interval.times[i].from) {
						for (var j = interval.times[i].from; j <= interval.times[i].to; j += minuteStep) {
							if (fromInMinutes <= j) {
								isInInterval = true;
								fromInMinutes = j;
								break;
							}
						}
					}
					else {
						isInInterval = true;
						fromInMinutes = interval.times[i].from;
					}
				}
				if (isInInterval) {
					break;
				}
			}
			if (isInInterval) {
				interval.from = new Date(interval.from.getFullYear(), interval.from.getMonth(), interval.from.getDate(), 0, fromInMinutes);
			}
			else {
				dayOffset = getFirstDayOffset(new Date(interval.from.getFullYear(), interval.from.getMonth(), interval.from.getDate() + 1), interval.weekdays);
				interval.from = new Date(interval.from.getFullYear(), interval.from.getMonth(), (interval.from.getDate() + 1) + dayOffset, 0, interval.times[0].from);
			}
		}
	}

	/**
	* Set last available date of given interval. (private)
	* @param interval object
	* @param minuteStep number
	*/
	function setLastAvailableDate(interval, minuteStep, selectableMinutes) {
		var dayOffset, toInMinutes;
		var isInInterval = false;
		if (interval.weekdays.indexOf(interval.to.getDay()) == -1) {
			dayOffset = getLastDayOffset(interval.to, interval.weekdays);
			interval.to = new Date(interval.to.getFullYear(), interval.to.getMonth(), interval.to.getDate() + dayOffset, 0, interval.times[interval.times.length - 1].to);
		}
		else {
			toInMinutes = (interval.to.getHours() * 60) + interval.to.getMinutes();
			for (var i = interval.times.length - 1; i >= 0; i--) {
				if (interval.times[i].from + selectableMinutes <= interval.times[i].to && interval.times[i].from + selectableMinutes <= toInMinutes) {
					if (toInMinutes <= interval.times[i].to) {
						for (var j = interval.times[i].from; j <= interval.times[i].to; j += minuteStep) {
							if (toInMinutes - minuteStep < j) {
								isInInterval = true;
								toInMinutes = j;
								break;
							}
						}
					}
					else {
						isInInterval = true;
						toInMinutes = interval.times[i].to;
					}
				}
				if (isInInterval) {
					break;
				}
			}
			if (isInInterval) {
				interval.to = new Date(interval.to.getFullYear(), interval.to.getMonth(), interval.to.getDate(), 0, toInMinutes);
			}
			else {
				dayOffset = getLastDayOffset(new Date(interval.to.getFullYear(), interval.to.getMonth(), interval.to.getDate() - 1), interval.weekdays);
				interval.to = new Date(interval.to.getFullYear(), interval.to.getMonth(), (interval.to.getDate() - 1) + dayOffset, 0, interval.times[interval.times.length - 1].to);
			}
		}
	}

	/**
	* Day offset when given date is available first time at one of the given weekdays. (private)
	* @param date date
	* @param weekdays array
	* @return number
	*/
	function getFirstDayOffset(date, weekdays) {
		var weekday = date.getDay();
		var dayOffset = 0;
		while (weekdays.indexOf(weekday) == -1) {
			dayOffset++;
			weekday++;
			if (weekday > 6) {
				weekday = 0;
			}
		}
		return dayOffset;
	}

	/**
	* Day offset when given date is available last time at one of the given weekdays. (private)
	* @param date date
	* @param weekdays array
	* @return number
	*/
	function getLastDayOffset(date, weekdays) {
		var weekday = date.getDay();
		var dayOffset = 0;
		while (weekdays.indexOf(weekday) == -1) {
			dayOffset--;
			weekday--;
			if (weekday < 0) {
				weekday = 6;
			}
		}
		return dayOffset;
	}

	return {
		init: dateSelector.init,
		selectYear: dateSelector.selectYear,
		selectMonth: dateSelector.selectMonth,
		selectDay: dateSelector.selectDay,
		selectHour: dateSelector.selectHour,
		selectMinute: dateSelector.selectMinute,
		selectTime: dateSelector.selectTime,
		selectByTimestamp: dateSelector.selectByTimestamp,
		destroy: dateSelector.destroy,
		getIsInitialized: dateSelector.getIsInitialized,
		getSelectedDate: dateSelector.getSelectedDate,
		getIsDateSelected: dateSelector.getIsDateSelected,
		getAvailableIntervals: dateSelector.getAvailableIntervals
	};

}();
