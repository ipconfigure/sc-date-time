(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'angular'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('angular'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.angular);
    global.main = mod.exports;
  }
})(this, function (exports, _angular) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _angular2 = _interopRequireDefault(_angular);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var MODULE_NAME = 'scDateTime';

  exports.default = MODULE_NAME;


  _angular2.default.module(MODULE_NAME, []).value('scDateTimeConfig', {
    defaultTheme: 'material',
    autosave: false,
    defaultMode: 'date',
    defaultDate: undefined, // should be date object!!
    displayMode: undefined,
    defaultOrientation: false,
    displayTwentyfour: false,
    compact: false,
    events: [],
    eventMaxScore: 0
  }).value('scDateTimeI18n', {
    previousMonth: 'Previous Month',
    nextMonth: 'Next Month',
    incrementHours: 'Increment Hours',
    decrementHours: 'Decrement Hours',
    incrementMinutes: 'Increment Minutes',
    decrementMinutes: 'Decrement Minutes',
    switchAmPm: 'Switch AM/PM',
    now: 'Now',
    cancel: 'Cancel',
    save: 'Save',
    weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    switchTo: 'Switch to',
    clock: 'Clock',
    calendar: 'Calendar'
  }).directive('timeDatePicker', ['$filter', '$sce', '$rootScope', '$parse', 'scDateTimeI18n', 'scDateTimeConfig', function ($filter, $sce, $rootScope, $parse, scDateTimeI18n, scDateTimeConfig) {
    var _dateFilter = $filter('date');
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        _weekdays: '=?tdWeekdays',
        _cameraCount: '=?camaraCount',
        _events: '=?events',
        _eventMaxScore: '=?eventMaxScore'
      },
      require: 'ngModel',
      templateUrl: function templateUrl(tElement, tAttrs) {
        if (tAttrs.theme == null || tAttrs.theme === '') {
          tAttrs.theme = scDateTimeConfig.defaultTheme;
        }

        return tAttrs.theme.indexOf('/') <= 0 ? 'scDateTime-' + tAttrs.theme + '.tpl' : tAttrs.theme;
      },
      link: function link(scope, element, attrs, ngModel) {
        attrs.$observe('defaultMode', function (val) {
          if (val !== 'time' && val !== 'date') {
            val = scDateTimeConfig.defaultMode;
          }

          return scope._mode = val;
        });
        attrs.$observe('defaultDate', function (val) {
          return scope._defaultDate = val != null && Date.parse(val) ? Date.parse(val) : scDateTimeConfig.defaultDate;
        });
        attrs.$observe('displayMode', function (val) {
          if (val !== 'full' && val !== 'time' && val !== 'date') {
            val = scDateTimeConfig.displayMode;
          }

          return scope._displayMode = val;
        });
        attrs.$observe('orientation', function (val) {
          return scope._verticalMode = val != null ? val === 'true' : scDateTimeConfig.defaultOrientation;
        });
        attrs.$observe('compact', function (val) {
          return scope._compact = val != null ? val === 'true' : scDateTimeConfig.compact;
        });
        attrs.$observe('displayTwentyfour', function (val) {
          return scope._hours24 = val != null ? val : scDateTimeConfig.displayTwentyfour;
        });
        attrs.$observe('mindate', function (val) {
          if (val != null && Date.parse(val)) {
            scope.restrictions.mindate = new Date(val);
            return scope.restrictions.mindate.setHours(0, 0, 0, 0);
          }
        });
        attrs.$observe('maxdate', function (val) {
          if (val != null && Date.parse(val)) {
            scope.restrictions.maxdate = new Date(val);
            return scope.restrictions.maxdate.setHours(23, 59, 59, 999);
          }
        });

        scope._weekdays = scope._weekdays || scDateTimeI18n.weekdays;
        scope.$watch('_weekdays', function (value) {
          if (value == null || !_angular2.default.isArray(value)) {
            return scope._weekdays = scDateTimeI18n.weekdays;
          }
        });

        scope._events = scope._events || scDateTimeI18n.events;
        scope._eventMaxScore = scope._eventMaxScore || scDateTimeI18n.eventMaxScore;

        ngModel.$render = function () {
          return scope.setDate(ngModel.$modelValue != null ? ngModel.$modelValue : scope._defaultDate, ngModel.$modelValue != null);
        };

        // Select contents of inputs when foccussed into
        _angular2.default.forEach(element.find('input'), function (input) {
          return _angular2.default.element(input).on('focus', function () {
            return setTimeout(function () {
              return input.select();
            }, 10);
          });
        });

        scope.autosave = false;
        if (attrs.autosave != null || scDateTimeConfig.autosave) {
          scope.saveUpdateDate = function () {
            return ngModel.$setViewValue(scope.date);
          };
          return scope.autosave = true;
        }

        var saveFn = $parse(attrs.onSave);
        var cancelFn = $parse(attrs.onCancel);
        scope.saveUpdateDate = function () {
          return true;
        };

        scope.save = function () {
          ngModel.$setViewValue(new Date(scope.date));
          return saveFn(scope.$parent, { $value: new Date(scope.date) });
        };

        return scope.cancel = function () {
          cancelFn(scope.$parent, {});
          return ngModel.$render();
        };
      },


      controller: ['$scope', 'scDateTimeI18n', function (scope, scDateTimeI18n) {
        var i = void 0;
        scope._defaultDate = scDateTimeConfig.defaultDate;
        scope._mode = scDateTimeConfig.defaultMode;
        scope._displayMode = scDateTimeConfig.displayMode;
        scope._verticalMode = scDateTimeConfig.defaultOrientation;
        scope._hours24 = scDateTimeConfig.displayTwentyfour;
        scope._compact = scDateTimeConfig.compact;
        scope.translations = scDateTimeI18n;
        scope.restrictions = {
          mindate: undefined,
          maxdate: undefined
        };

        scope.addZero = function (min) {
          if (min > 9) {
            return min.toString();
          }return ('0' + min).slice(-2);
        };

        scope.setDate = function (newVal, save) {
          if (save == null) {
            save = true;
          }

          scope.date = newVal ? new Date(newVal) : new Date();
          scope.calendar._year = scope.date.getFullYear();
          scope.calendar._month = scope.date.getMonth();
          scope.clock._minutes = scope.addZero(scope.date.getMinutes());
          scope.clock._hours = scope._hours24 ? scope.date.getHours() : scope.date.getHours() % 12;
          if (!scope._hours24 && scope.clock._hours === 0) {
            scope.clock._hours = 12;
          }

          return scope.calendar.yearChange(save);
        };

        scope.display = {
          fullTitle: function fullTitle() {
            var _timeString = scope._hours24 ? 'HH:mm' : 'h:mm a';
            if (scope._displayMode === 'full' && !scope._verticalMode) {
              return _dateFilter(scope.date, 'EEEE d MMMM yyyy, ' + _timeString);
            } else if (scope._displayMode === 'time') {
              return _dateFilter(scope.date, _timeString);
            } else if (scope._displayMode === 'date') {
              return _dateFilter(scope.date, 'EEE d MMM yyyy');
            }return _dateFilter(scope.date, 'd MMM yyyy, ' + _timeString);
          },
          title: function title() {
            if (scope._mode === 'date') {
              return _dateFilter(scope.date, scope._displayMode === 'date' ? 'EEEE' : 'EEEE ' + (scope._hours24 ? 'HH:mm' : 'h:mm a'));
            }return _dateFilter(scope.date, 'MMMM d yyyy');
          },
          super: function _super() {
            if (scope._mode === 'date') {
              return _dateFilter(scope.date, 'MMM');
            }return '';
          },
          main: function main() {
            return $sce.trustAsHtml(scope._mode === 'date' ? _dateFilter(scope.date, 'd') : scope._hours24 ? _dateFilter(scope.date, 'HH:mm') : _dateFilter(scope.date, 'h:mm') + '<small>' + _dateFilter(scope.date, 'a') + '</small>');
          },
          sub: function sub() {
            if (scope._mode === 'date') {
              return _dateFilter(scope.date, 'yyyy');
            }return _dateFilter(scope.date, 'HH:mm');
          }
        };

        scope.calendar = {
          _month: 0,
          _year: 0,
          _months: [],
          _allMonths: function () {
            var result = [];
            for (i = 0; i <= 11; i++) {
              result.push(_dateFilter(new Date(0, i), 'MMMM'));
            }

            return result;
          }(),
          offsetMargin: function offsetMargin() {
            return new Date(this._year, this._month).getDay() * 2.7 + 'rem';
          },
          isVisible: function isVisible(d) {
            return new Date(this._year, this._month, d).getMonth() === this._month;
          },
          isDisabled: function isDisabled(d) {
            var currentDate = new Date(this._year, this._month, d);
            var mindate = scope.restrictions.mindate;
            var maxdate = scope.restrictions.maxdate;

            return mindate != null && currentDate < mindate || maxdate != null && currentDate > maxdate;
          },
          isPrevMonthButtonHidden: function isPrevMonthButtonHidden() {
            var date = scope.restrictions.mindate;
            return date != null && this._month <= date.getMonth() && this._year <= date.getFullYear();
          },
          isNextMonthButtonHidden: function isNextMonthButtonHidden() {
            var date = scope.restrictions.maxdate;
            return date != null && this._month >= date.getMonth() && this._year >= date.getFullYear();
          },
          class: function _class(d) {
            var classes = [];
            if (scope.date != null && new Date(this._year, this._month, d).getTime() === new Date(scope.date.getTime()).setHours(0, 0, 0, 0)) {
              classes.push('selected');
            }

            if (scope._eventMaxScore !== 0) {
              var dateString = this._year + '-' + (this._month + 1) + '-' + d,
                  score = scope._events[dateString] / scope._eventMaxScore;

              if (score) {
                classes.push('event');

                if (score > 0.9) {
                  classes.push('event-high');
                }

                if (score < 0.5) {
                  classes.push('event-low');
                }
              }
            }

            if (new Date(this._year, this._month, d).getTime() === new Date().setHours(0, 0, 0, 0)) {
              classes.push('today');
            }

            return classes.join(' ');
          },
          select: function select(d) {
            scope.date.setFullYear(this._year, this._month, d);
            return scope.saveUpdateDate();
          },
          monthChange: function monthChange(save) {
            if (save == null) {
              save = true;
            }

            if (this._year == null || isNaN(this._year)) {
              this._year = new Date().getFullYear();
            }

            var mindate = scope.restrictions.mindate;
            var maxdate = scope.restrictions.maxdate;

            if (mindate != null && mindate.getFullYear() === this._year && mindate.getMonth() >= this._month) {
              this._month = Math.max(mindate.getMonth(), this._month);
            }

            if (maxdate != null && maxdate.getFullYear() === this._year && maxdate.getMonth() <= this._month) {
              this._month = Math.min(maxdate.getMonth(), this._month);
            }

            scope.date.setFullYear(this._year, this._month);
            if (scope.date.getMonth() !== this._month) {
              scope.date.setDate(0);
            }

            if (mindate != null && scope.date < mindate) {
              scope.date.setDate(mindate.getTime());
              scope.calendar.select(mindate.getDate());
            }

            if (maxdate != null && scope.date > maxdate) {
              scope.date.setDate(maxdate.getTime());
              scope.calendar.select(maxdate.getDate());
            }

            if (save) {
              return scope.saveUpdateDate();
            }
          },
          _incMonth: function _incMonth(months) {
            this._month += months;
            while (this._month < 0 || this._month > 11) {
              if (this._month < 0) {
                this._month += 12;
                this._year--;
              } else {
                this._month -= 12;
                this._year++;
              }
            }

            return this.monthChange();
          },
          yearChange: function yearChange(save) {
            if (save == null) {
              save = true;
            }

            if (scope.calendar._year == null || scope.calendar._year === '') {
              return;
            }

            var mindate = scope.restrictions.mindate;
            var maxdate = scope.restrictions.maxdate;

            i = mindate != null && mindate.getFullYear() === scope.calendar._year ? mindate.getMonth() : 0;
            var len = maxdate != null && maxdate.getFullYear() === scope.calendar._year ? maxdate.getMonth() : 11;
            scope.calendar._months = scope.calendar._allMonths.slice(i, len + 1);
            return scope.calendar.monthChange(save);
          }
        };
        scope.clock = {
          _minutes: '00',
          _hours: 0,
          _incHours: function _incHours(inc) {
            this._hours = scope._hours24 ? Math.max(0, Math.min(23, this._hours + inc)) : Math.max(1, Math.min(12, this._hours + inc));
            if (isNaN(this._hours)) {
              return this._hours = 0;
            }
          },
          _incMinutes: function _incMinutes(inc) {
            return this._minutes = scope.addZero(Math.max(0, Math.min(59, parseInt(this._minutes) + inc))).toString();
          },
          setAM: function setAM(b) {
            if (b == null) {
              b = !this.isAM();
            }

            if (b && !this.isAM()) {
              scope.date.setHours(scope.date.getHours() - 12);
            } else if (!b && this.isAM()) {
              scope.date.setHours(scope.date.getHours() + 12);
            }

            return scope.saveUpdateDate();
          },
          isAM: function isAM() {
            return scope.date.getHours() < 12;
          }
        };
        scope.$watch('clock._minutes', function (val, oldVal) {
          if (!val) {
            return;
          }

          var intMin = parseInt(val);
          if (!isNaN(intMin) && intMin >= 0 && intMin <= 59 && intMin !== scope.date.getMinutes()) {
            scope.date.setMinutes(intMin);
            return scope.saveUpdateDate();
          }
        });
        scope.$watch('clock._hours', function (val) {
          if (val != null && !isNaN(val)) {
            if (!scope._hours24) {
              if (val === 24) {
                val = 12;
              } else if (val === 12) {
                val = 0;
              } else if (!scope.clock.isAM()) {
                val += 12;
              }
            }

            if (val !== scope.date.getHours()) {
              scope.date.setHours(val);
              return scope.saveUpdateDate();
            }
          }
        });

        scope.setNow = function () {
          scope.setDate();
          return scope.saveUpdateDate();
        };

        scope.modeClass = function () {
          if (scope._displayMode != null) {
            scope._mode = scope._displayMode;
          }

          return '' + (scope._verticalMode ? 'vertical ' : '') + (scope._displayMode === 'full' ? 'full-mode' : scope._displayMode === 'time' ? 'time-only' : scope._displayMode === 'date' ? 'date-only' : scope._mode === 'date' ? 'date-mode' : 'time-mode') + ' ' + (scope._compact ? 'compact' : '');
        };

        scope.modeSwitch = function () {
          return scope._mode = scope._displayMode != null ? scope._displayMode : scope._mode === 'date' ? 'time' : 'date';
        };
        return scope.modeSwitchText = function () {
          return scDateTimeI18n.switchTo + ' ' + (scope._mode === 'date' ? scDateTimeI18n.clock : scDateTimeI18n.calendar);
        };
      }]
    };
  }]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiTU9EVUxFX05BTUUiLCJtb2R1bGUiLCJ2YWx1ZSIsImRlZmF1bHRUaGVtZSIsImF1dG9zYXZlIiwiZGVmYXVsdE1vZGUiLCJkZWZhdWx0RGF0ZSIsInVuZGVmaW5lZCIsImRpc3BsYXlNb2RlIiwiZGVmYXVsdE9yaWVudGF0aW9uIiwiZGlzcGxheVR3ZW50eWZvdXIiLCJjb21wYWN0IiwiZXZlbnRzIiwiZXZlbnRNYXhTY29yZSIsInByZXZpb3VzTW9udGgiLCJuZXh0TW9udGgiLCJpbmNyZW1lbnRIb3VycyIsImRlY3JlbWVudEhvdXJzIiwiaW5jcmVtZW50TWludXRlcyIsImRlY3JlbWVudE1pbnV0ZXMiLCJzd2l0Y2hBbVBtIiwibm93IiwiY2FuY2VsIiwic2F2ZSIsIndlZWtkYXlzIiwic3dpdGNoVG8iLCJjbG9jayIsImNhbGVuZGFyIiwiZGlyZWN0aXZlIiwiJGZpbHRlciIsIiRzY2UiLCIkcm9vdFNjb3BlIiwiJHBhcnNlIiwic2NEYXRlVGltZUkxOG4iLCJzY0RhdGVUaW1lQ29uZmlnIiwiX2RhdGVGaWx0ZXIiLCJyZXN0cmljdCIsInJlcGxhY2UiLCJzY29wZSIsIl93ZWVrZGF5cyIsIl9jYW1lcmFDb3VudCIsIl9ldmVudHMiLCJfZXZlbnRNYXhTY29yZSIsInJlcXVpcmUiLCJ0ZW1wbGF0ZVVybCIsInRFbGVtZW50IiwidEF0dHJzIiwidGhlbWUiLCJpbmRleE9mIiwibGluayIsImVsZW1lbnQiLCJhdHRycyIsIm5nTW9kZWwiLCIkb2JzZXJ2ZSIsInZhbCIsIl9tb2RlIiwiX2RlZmF1bHREYXRlIiwiRGF0ZSIsInBhcnNlIiwiX2Rpc3BsYXlNb2RlIiwiX3ZlcnRpY2FsTW9kZSIsIl9jb21wYWN0IiwiX2hvdXJzMjQiLCJyZXN0cmljdGlvbnMiLCJtaW5kYXRlIiwic2V0SG91cnMiLCJtYXhkYXRlIiwiJHdhdGNoIiwiaXNBcnJheSIsIiRyZW5kZXIiLCJzZXREYXRlIiwiJG1vZGVsVmFsdWUiLCJmb3JFYWNoIiwiZmluZCIsImlucHV0Iiwib24iLCJzZXRUaW1lb3V0Iiwic2VsZWN0Iiwic2F2ZVVwZGF0ZURhdGUiLCIkc2V0Vmlld1ZhbHVlIiwiZGF0ZSIsInNhdmVGbiIsIm9uU2F2ZSIsImNhbmNlbEZuIiwib25DYW5jZWwiLCIkcGFyZW50IiwiJHZhbHVlIiwiY29udHJvbGxlciIsImkiLCJ0cmFuc2xhdGlvbnMiLCJhZGRaZXJvIiwibWluIiwidG9TdHJpbmciLCJzbGljZSIsIm5ld1ZhbCIsIl95ZWFyIiwiZ2V0RnVsbFllYXIiLCJfbW9udGgiLCJnZXRNb250aCIsIl9taW51dGVzIiwiZ2V0TWludXRlcyIsIl9ob3VycyIsImdldEhvdXJzIiwieWVhckNoYW5nZSIsImRpc3BsYXkiLCJmdWxsVGl0bGUiLCJfdGltZVN0cmluZyIsInRpdGxlIiwic3VwZXIiLCJtYWluIiwidHJ1c3RBc0h0bWwiLCJzdWIiLCJfbW9udGhzIiwiX2FsbE1vbnRocyIsInJlc3VsdCIsInB1c2giLCJvZmZzZXRNYXJnaW4iLCJnZXREYXkiLCJpc1Zpc2libGUiLCJkIiwiaXNEaXNhYmxlZCIsImN1cnJlbnREYXRlIiwiaXNQcmV2TW9udGhCdXR0b25IaWRkZW4iLCJpc05leHRNb250aEJ1dHRvbkhpZGRlbiIsImNsYXNzIiwiY2xhc3NlcyIsImdldFRpbWUiLCJkYXRlU3RyaW5nIiwic2NvcmUiLCJqb2luIiwic2V0RnVsbFllYXIiLCJtb250aENoYW5nZSIsImlzTmFOIiwiTWF0aCIsIm1heCIsImdldERhdGUiLCJfaW5jTW9udGgiLCJtb250aHMiLCJsZW4iLCJfaW5jSG91cnMiLCJpbmMiLCJfaW5jTWludXRlcyIsInBhcnNlSW50Iiwic2V0QU0iLCJiIiwiaXNBTSIsIm9sZFZhbCIsImludE1pbiIsInNldE1pbnV0ZXMiLCJzZXROb3ciLCJtb2RlQ2xhc3MiLCJtb2RlU3dpdGNoIiwibW9kZVN3aXRjaFRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLE1BQU1BLGNBQWMs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LFFBQXhCLFVBQzlCYSxNQUFNaUIsS0FBTixLQUFnQixNQUFoQixHQUF5QnRCLGVBQWVQLEtBQXhDLEdBQWdETyxlQUFlTixRQURqQztBQUFBLFNBQTlCO0FBRUQsT0FwUlc7QUF0RlAsS0FBUDtBQTZXRCxHQWhYMkIsQ0E3QjlCIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcblxuY29uc3QgTU9EVUxFX05BTUUgPSAnc2NEYXRlVGltZSc7XG5cbmV4cG9ydCBkZWZhdWx0IE1PRFVMRV9OQU1FO1xuXG5hbmd1bGFyLm1vZHVsZShNT0RVTEVfTkFNRSwgW10pXG4udmFsdWUoJ3NjRGF0ZVRpbWVDb25maWcnLCB7XG4gIGRlZmF1bHRUaGVtZTogJ21hdGVyaWFsJyxcbiAgYXV0b3NhdmU6IGZhbHNlLFxuICBkZWZhdWx0TW9kZTogJ2RhdGUnLFxuICBkZWZhdWx0RGF0ZTogdW5kZWZpbmVkLCAvLyBzaG91bGQgYmUgZGF0ZSBvYmplY3QhIVxuICBkaXNwbGF5TW9kZTogdW5kZWZpbmVkLFxuICBkZWZhdWx0T3JpZW50YXRpb246IGZhbHNlLFxuICBkaXNwbGF5VHdlbnR5Zm91cjogZmFsc2UsXG4gIGNvbXBhY3Q6IGZhbHNlLFxuICBldmVudHM6IFtdLFxuICBldmVudE1heFNjb3JlOiAwXG59LFxuKS52YWx1ZSgnc2NEYXRlVGltZUkxOG4nLCB7XG4gIHByZXZpb3VzTW9udGg6ICdQcmV2aW91cyBNb250aCcsXG4gIG5leHRNb250aDogJ05leHQgTW9udGgnLFxuICBpbmNyZW1lbnRIb3VyczogJ0luY3JlbWVudCBIb3VycycsXG4gIGRlY3JlbWVudEhvdXJzOiAnRGVjcmVtZW50IEhvdXJzJyxcbiAgaW5jcmVtZW50TWludXRlczogJ0luY3JlbWVudCBNaW51dGVzJyxcbiAgZGVjcmVtZW50TWludXRlczogJ0RlY3JlbWVudCBNaW51dGVzJyxcbiAgc3dpdGNoQW1QbTogJ1N3aXRjaCBBTS9QTScsXG4gIG5vdzogJ05vdycsXG4gIGNhbmNlbDogJ0NhbmNlbCcsXG4gIHNhdmU6ICdTYXZlJyxcbiAgd2Vla2RheXM6IFsnUycsICdNJywgJ1QnLCAnVycsICdUJywgJ0YnLCAnUyddLFxuICBzd2l0Y2hUbzogJ1N3aXRjaCB0bycsXG4gIGNsb2NrOiAnQ2xvY2snLFxuICBjYWxlbmRhcjogJ0NhbGVuZGFyJyxcbn0sXG4pLmRpcmVjdGl2ZSgndGltZURhdGVQaWNrZXInLCBbJyRmaWx0ZXInLCAnJHNjZScsICckcm9vdFNjb3BlJywgJyRwYXJzZScsICdzY0RhdGVUaW1lSTE4bicsICdzY0RhdGVUaW1lQ29uZmlnJyxcbiAgZnVuY3Rpb24gKCRmaWx0ZXIsICRzY2UsICRyb290U2NvcGUsICRwYXJzZSwgc2NEYXRlVGltZUkxOG4sIHNjRGF0ZVRpbWVDb25maWcpIHtcbiAgICBjb25zdCBfZGF0ZUZpbHRlciA9ICRmaWx0ZXIoJ2RhdGUnKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgX3dlZWtkYXlzOiAnPT90ZFdlZWtkYXlzJyxcbiAgICAgICAgX2NhbWVyYUNvdW50OiAnPT9jYW1hcmFDb3VudCcsXG4gICAgICAgIF9ldmVudHM6ICc9P2V2ZW50cycsXG4gICAgICAgIF9ldmVudE1heFNjb3JlOiAnPT9ldmVudE1heFNjb3JlJ1xuICAgICAgfSxcbiAgICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICAgIHRlbXBsYXRlVXJsKHRFbGVtZW50LCB0QXR0cnMpIHtcbiAgICAgICAgaWYgKCh0QXR0cnMudGhlbWUgPT0gbnVsbCkgfHwgKHRBdHRycy50aGVtZSA9PT0gJycpKSB7IHRBdHRycy50aGVtZSA9IHNjRGF0ZVRpbWVDb25maWcuZGVmYXVsdFRoZW1lOyB9XG5cbiAgICAgICAgcmV0dXJuIHRBdHRycy50aGVtZS5pbmRleE9mKCcvJykgPD0gMCA/IGBzY0RhdGVUaW1lLSR7dEF0dHJzLnRoZW1lfS50cGxgIDogdEF0dHJzLnRoZW1lO1xuICAgICAgfSxcblxuICAgICAgbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nTW9kZWwpIHtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2RlZmF1bHRNb2RlJywgdmFsID0+IHtcbiAgICAgICAgICBpZiAoKHZhbCAhPT0gJ3RpbWUnKSAmJiAodmFsICE9PSAnZGF0ZScpKSB7IHZhbCA9IHNjRGF0ZVRpbWVDb25maWcuZGVmYXVsdE1vZGU7IH1cblxuICAgICAgICAgIHJldHVybiBzY29wZS5fbW9kZSA9IHZhbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdkZWZhdWx0RGF0ZScsIHZhbCA9PlxuICAgICAgICBzY29wZS5fZGVmYXVsdERhdGUgPSAodmFsICE9IG51bGwpICYmIERhdGUucGFyc2UodmFsKSA/IERhdGUucGFyc2UodmFsKVxuICAgICAgICA6IHNjRGF0ZVRpbWVDb25maWcuZGVmYXVsdERhdGUsXG4gICAgICApO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnZGlzcGxheU1vZGUnLCB2YWwgPT4ge1xuICAgICAgICAgIGlmICgodmFsICE9PSAnZnVsbCcpICYmICh2YWwgIT09ICd0aW1lJykgJiYgKHZhbCAhPT0gJ2RhdGUnKSkgeyB2YWwgPSBzY0RhdGVUaW1lQ29uZmlnLmRpc3BsYXlNb2RlOyB9XG5cbiAgICAgICAgICByZXR1cm4gc2NvcGUuX2Rpc3BsYXlNb2RlID0gdmFsO1xuICAgICAgICB9KTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ29yaWVudGF0aW9uJywgdmFsID0+IHNjb3BlLl92ZXJ0aWNhbE1vZGUgPSAodmFsICE9IG51bGwpID8gdmFsID09PSAndHJ1ZScgOiBzY0RhdGVUaW1lQ29uZmlnLmRlZmF1bHRPcmllbnRhdGlvbik7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdjb21wYWN0JywgdmFsID0+IHNjb3BlLl9jb21wYWN0ID0gKHZhbCAhPSBudWxsKSA/IHZhbCA9PT0gJ3RydWUnIDogc2NEYXRlVGltZUNvbmZpZy5jb21wYWN0KTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2Rpc3BsYXlUd2VudHlmb3VyJywgdmFsID0+IHNjb3BlLl9ob3VyczI0ID0gKHZhbCAhPSBudWxsKSA/IHZhbCA6IHNjRGF0ZVRpbWVDb25maWcuZGlzcGxheVR3ZW50eWZvdXIpO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnbWluZGF0ZScsIHZhbCA9PiB7XG4gICAgICAgICAgaWYgKCh2YWwgIT0gbnVsbCkgJiYgRGF0ZS5wYXJzZSh2YWwpKSB7XG4gICAgICAgICAgICBzY29wZS5yZXN0cmljdGlvbnMubWluZGF0ZSA9IG5ldyBEYXRlKHZhbCk7XG4gICAgICAgICAgICByZXR1cm4gc2NvcGUucmVzdHJpY3Rpb25zLm1pbmRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ21heGRhdGUnLCB2YWwgPT4ge1xuICAgICAgICAgIGlmICgodmFsICE9IG51bGwpICYmIERhdGUucGFyc2UodmFsKSkge1xuICAgICAgICAgICAgc2NvcGUucmVzdHJpY3Rpb25zLm1heGRhdGUgPSBuZXcgRGF0ZSh2YWwpO1xuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLnJlc3RyaWN0aW9ucy5tYXhkYXRlLnNldEhvdXJzKDIzLCA1OSwgNTksIDk5OSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBzY29wZS5fd2Vla2RheXMgPSBzY29wZS5fd2Vla2RheXMgfHwgc2NEYXRlVGltZUkxOG4ud2Vla2RheXM7XG4gICAgICAgIHNjb3BlLiR3YXRjaCgnX3dlZWtkYXlzJywgdmFsdWUgPT4ge1xuICAgICAgICAgIGlmICgodmFsdWUgPT0gbnVsbCkgfHwgIWFuZ3VsYXIuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5fd2Vla2RheXMgPSBzY0RhdGVUaW1lSTE4bi53ZWVrZGF5cztcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNjb3BlLl9ldmVudHMgPSBzY29wZS5fZXZlbnRzIHx8IHNjRGF0ZVRpbWVJMThuLmV2ZW50czsgICAgICAgIFxuICAgICAgICBzY29wZS5fZXZlbnRNYXhTY29yZSA9IHNjb3BlLl9ldmVudE1heFNjb3JlIHx8IHNjRGF0ZVRpbWVJMThuLmV2ZW50TWF4U2NvcmU7IFxuXG4gICAgICAgIG5nTW9kZWwuJHJlbmRlciA9ICgpID0+IHNjb3BlLnNldERhdGUobmdNb2RlbC4kbW9kZWxWYWx1ZSAhPSBudWxsID8gbmdNb2RlbC4kbW9kZWxWYWx1ZSA6IHNjb3BlLl9kZWZhdWx0RGF0ZSwgKG5nTW9kZWwuJG1vZGVsVmFsdWUgIT0gbnVsbCkpO1xuXG4gICAgICAgIC8vIFNlbGVjdCBjb250ZW50cyBvZiBpbnB1dHMgd2hlbiBmb2NjdXNzZWQgaW50b1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goZWxlbWVudC5maW5kKCdpbnB1dCcpLFxuICAgICAgICBpbnB1dCA9PlxuICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChpbnB1dCkub24oJ2ZvY3VzJywgKCkgPT4gc2V0VGltZW91dCgoKCkgPT4gaW5wdXQuc2VsZWN0KCkpLCAxMCkpLFxuICAgICAgKTtcblxuICAgICAgICBzY29wZS5hdXRvc2F2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoKGF0dHJzLmF1dG9zYXZlICE9IG51bGwpIHx8IHNjRGF0ZVRpbWVDb25maWcuYXV0b3NhdmUpIHtcbiAgICAgICAgICBzY29wZS5zYXZlVXBkYXRlRGF0ZSA9ICgpID0+IG5nTW9kZWwuJHNldFZpZXdWYWx1ZShzY29wZS5kYXRlKTtcbiAgICAgICAgICByZXR1cm4gc2NvcGUuYXV0b3NhdmUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2F2ZUZuID0gJHBhcnNlKGF0dHJzLm9uU2F2ZSk7XG4gICAgICAgIGNvbnN0IGNhbmNlbEZuID0gJHBhcnNlKGF0dHJzLm9uQ2FuY2VsKTtcbiAgICAgICAgc2NvcGUuc2F2ZVVwZGF0ZURhdGUgPSAoKSA9PiB0cnVlO1xuXG4gICAgICAgIHNjb3BlLnNhdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKG5ldyBEYXRlKHNjb3BlLmRhdGUpKTtcbiAgICAgICAgICByZXR1cm4gc2F2ZUZuKHNjb3BlLiRwYXJlbnQsIHsgJHZhbHVlOiBuZXcgRGF0ZShzY29wZS5kYXRlKSB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNhbmNlbEZuKHNjb3BlLiRwYXJlbnQsIHt9KTtcbiAgICAgICAgICByZXR1cm4gbmdNb2RlbC4kcmVuZGVyKCk7XG4gICAgICAgIH07XG4gICAgICB9LFxuXG4gICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICdzY0RhdGVUaW1lSTE4bicsIGZ1bmN0aW9uIChzY29wZSwgc2NEYXRlVGltZUkxOG4pIHtcbiAgICAgICAgbGV0IGk7XG4gICAgICAgIHNjb3BlLl9kZWZhdWx0RGF0ZSA9IHNjRGF0ZVRpbWVDb25maWcuZGVmYXVsdERhdGU7XG4gICAgICAgIHNjb3BlLl9tb2RlID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0TW9kZTtcbiAgICAgICAgc2NvcGUuX2Rpc3BsYXlNb2RlID0gc2NEYXRlVGltZUNvbmZpZy5kaXNwbGF5TW9kZTtcbiAgICAgICAgc2NvcGUuX3ZlcnRpY2FsTW9kZSA9IHNjRGF0ZVRpbWVDb25maWcuZGVmYXVsdE9yaWVudGF0aW9uO1xuICAgICAgICBzY29wZS5faG91cnMyNCA9IHNjRGF0ZVRpbWVDb25maWcuZGlzcGxheVR3ZW50eWZvdXI7XG4gICAgICAgIHNjb3BlLl9jb21wYWN0ID0gc2NEYXRlVGltZUNvbmZpZy5jb21wYWN0O1xuICAgICAgICBzY29wZS50cmFuc2xhdGlvbnMgPSBzY0RhdGVUaW1lSTE4bjtcbiAgICAgICAgc2NvcGUucmVzdHJpY3Rpb25zID0ge1xuICAgICAgICAgIG1pbmRhdGU6IHVuZGVmaW5lZCxcbiAgICAgICAgICBtYXhkYXRlOiB1bmRlZmluZWQsXG4gICAgICAgIH07XG5cbiAgICAgICAgc2NvcGUuYWRkWmVybyA9IGZ1bmN0aW9uIChtaW4pIHtcbiAgICAgICAgICBpZiAobWluID4gOSkgeyByZXR1cm4gbWluLnRvU3RyaW5nKCk7IH0gcmV0dXJuIChgMCR7bWlufWApLnNsaWNlKC0yKTtcbiAgICAgICAgfTtcblxuICAgICAgICBzY29wZS5zZXREYXRlID0gZnVuY3Rpb24gKG5ld1ZhbCwgc2F2ZSkge1xuICAgICAgICAgIGlmIChzYXZlID09IG51bGwpIHsgc2F2ZSA9IHRydWU7IH1cblxuICAgICAgICAgIHNjb3BlLmRhdGUgPSBuZXdWYWwgPyBuZXcgRGF0ZShuZXdWYWwpIDogbmV3IERhdGUoKTtcbiAgICAgICAgICBzY29wZS5jYWxlbmRhci5feWVhciA9IHNjb3BlLmRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICBzY29wZS5jYWxlbmRhci5fbW9udGggPSBzY29wZS5kYXRlLmdldE1vbnRoKCk7XG4gICAgICAgICAgc2NvcGUuY2xvY2suX21pbnV0ZXMgPSBzY29wZS5hZGRaZXJvKHNjb3BlLmRhdGUuZ2V0TWludXRlcygpKTtcbiAgICAgICAgICBzY29wZS5jbG9jay5faG91cnMgPSBzY29wZS5faG91cnMyNCA/IHNjb3BlLmRhdGUuZ2V0SG91cnMoKSA6IHNjb3BlLmRhdGUuZ2V0SG91cnMoKSAlIDEyO1xuICAgICAgICAgIGlmICghc2NvcGUuX2hvdXJzMjQgJiYgKHNjb3BlLmNsb2NrLl9ob3VycyA9PT0gMCkpIHsgc2NvcGUuY2xvY2suX2hvdXJzID0gMTI7IH1cblxuICAgICAgICAgIHJldHVybiBzY29wZS5jYWxlbmRhci55ZWFyQ2hhbmdlKHNhdmUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLmRpc3BsYXkgPSB7XG4gICAgICAgICAgZnVsbFRpdGxlKCkge1xuICAgICAgICAgICAgY29uc3QgX3RpbWVTdHJpbmcgPSBzY29wZS5faG91cnMyNCA/ICdISDptbScgOiAnaDptbSBhJztcbiAgICAgICAgICAgIGlmICgoc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAnZnVsbCcpICYmICFzY29wZS5fdmVydGljYWxNb2RlKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCBgRUVFRSBkIE1NTU0geXl5eSwgJHtfdGltZVN0cmluZ31gKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAndGltZScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsIF90aW1lU3RyaW5nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAnZGF0ZScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdFRUUgZCBNTU0geXl5eScpO1xuICAgICAgICAgICAgfSByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgYGQgTU1NIHl5eXksICR7X3RpbWVTdHJpbmd9YCk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHRpdGxlKCkge1xuICAgICAgICAgICAgaWYgKHNjb3BlLl9tb2RlID09PSAnZGF0ZScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsIChzY29wZS5fZGlzcGxheU1vZGUgPT09ICdkYXRlJyA/ICdFRUVFJyA6IGBFRUVFICR7XG4gICAgICAgICAgICAgIHNjb3BlLl9ob3VyczI0ID8gJ0hIOm1tJyA6ICdoOm1tIGEnXG4gICAgICAgICAgICB9YCksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgfSByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ01NTU0gZCB5eXl5Jyk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHN1cGVyKCkge1xuICAgICAgICAgICAgaWYgKHNjb3BlLl9tb2RlID09PSAnZGF0ZScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdNTU0nKTtcbiAgICAgICAgICAgIH0gcmV0dXJuICcnO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBtYWluKCkge1xuICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoXG4gICAgICAgICAgc2NvcGUuX21vZGUgPT09ICdkYXRlJyA/IF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdkJylcbiAgICAgICAgICA6XG4gICAgICAgICAgICBzY29wZS5faG91cnMyNCA/IF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdISDptbScpXG4gICAgICAgICAgICA6IGAke19kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICdoOm1tJyl9PHNtYWxsPiR7X2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ2EnKX08L3NtYWxsPmAsXG4gICAgICAgICk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHN1YigpIHtcbiAgICAgICAgICAgIGlmIChzY29wZS5fbW9kZSA9PT0gJ2RhdGUnKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAneXl5eScpO1xuICAgICAgICAgICAgfSByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ0hIOm1tJyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcblxuICAgICAgICBzY29wZS5jYWxlbmRhciA9IHtcbiAgICAgICAgICBfbW9udGg6IDAsXG4gICAgICAgICAgX3llYXI6IDAsXG4gICAgICAgICAgX21vbnRoczogW10sXG4gICAgICAgICAgX2FsbE1vbnRoczogKCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPD0gMTE7IGkrKykge1xuICAgICAgICAgICAgICByZXN1bHQucHVzaChfZGF0ZUZpbHRlcihuZXcgRGF0ZSgwLCBpKSwgJ01NTU0nKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSkoKSksXG4gICAgICAgICAgb2Zmc2V0TWFyZ2luKCkgeyByZXR1cm4gYCR7bmV3IERhdGUodGhpcy5feWVhciwgdGhpcy5fbW9udGgpLmdldERheSgpICogMi43fXJlbWA7IH0sXG5cbiAgICAgICAgICBpc1Zpc2libGUoZCkgeyByZXR1cm4gbmV3IERhdGUodGhpcy5feWVhciwgdGhpcy5fbW9udGgsIGQpLmdldE1vbnRoKCkgPT09IHRoaXMuX21vbnRoOyB9LFxuXG4gICAgICAgICAgaXNEaXNhYmxlZChkKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RGF0ZSA9IG5ldyBEYXRlKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoLCBkKTtcbiAgICAgICAgICAgIGNvbnN0IHsgbWluZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xuICAgICAgICAgICAgY29uc3QgeyBtYXhkYXRlIH0gPSBzY29wZS5yZXN0cmljdGlvbnM7XG4gICAgICAgICAgICByZXR1cm4gKChtaW5kYXRlICE9IG51bGwpICYmIChjdXJyZW50RGF0ZSA8IG1pbmRhdGUpKSB8fCAoKG1heGRhdGUgIT0gbnVsbCkgJiYgKGN1cnJlbnREYXRlID4gbWF4ZGF0ZSkpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBpc1ByZXZNb250aEJ1dHRvbkhpZGRlbigpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBzY29wZS5yZXN0cmljdGlvbnMubWluZGF0ZTtcbiAgICAgICAgICAgIHJldHVybiAoZGF0ZSAhPSBudWxsKSAmJiAodGhpcy5fbW9udGggPD0gZGF0ZS5nZXRNb250aCgpKSAmJiAodGhpcy5feWVhciA8PSBkYXRlLmdldEZ1bGxZZWFyKCkpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBpc05leHRNb250aEJ1dHRvbkhpZGRlbigpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBzY29wZS5yZXN0cmljdGlvbnMubWF4ZGF0ZTtcbiAgICAgICAgICAgIHJldHVybiAoZGF0ZSAhPSBudWxsKSAmJiAodGhpcy5fbW9udGggPj0gZGF0ZS5nZXRNb250aCgpKSAmJiAodGhpcy5feWVhciA+PSBkYXRlLmdldEZ1bGxZZWFyKCkpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBjbGFzcyhkKSB7XG4gICAgICAgICAgICBsZXQgY2xhc3NlcyA9IFtdO1xuICAgICAgICAgICAgaWYgKChzY29wZS5kYXRlICE9IG51bGwpICYmIChuZXcgRGF0ZSh0aGlzLl95ZWFyLCB0aGlzLl9tb250aCwgZCkuZ2V0VGltZSgpID09PSBuZXcgRGF0ZShzY29wZS5kYXRlLmdldFRpbWUoKSkuc2V0SG91cnMoMCxcbiAgICAgICAgICAgIDAsIDAsIDApKSkge1xuICAgICAgICAgICAgICBjbGFzc2VzLnB1c2goJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzY29wZS5fZXZlbnRNYXhTY29yZSAhPT0gMCkgeyAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHZhciBkYXRlU3RyaW5nID0gdGhpcy5feWVhciArICctJyArICh0aGlzLl9tb250aCArIDEpICsgJy0nICsgZCxcbiAgICAgICAgICAgICAgICBzY29yZSA9IHNjb3BlLl9ldmVudHNbZGF0ZVN0cmluZ10gLyBzY29wZS5fZXZlbnRNYXhTY29yZTtcblxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaWYgKHNjb3JlKSB7XG4gICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCdldmVudCcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNjb3JlID4gMC45KSB7XG4gICAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2goJ2V2ZW50LWhpZ2gnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc2NvcmUgPCAwLjUpIHtcbiAgICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaCgnZXZlbnQtbG93Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuZXcgRGF0ZSh0aGlzLl95ZWFyLCB0aGlzLl9tb250aCwgZCkuZ2V0VGltZSgpID09PSBuZXcgRGF0ZSgpLnNldEhvdXJzKDAsIDAsIDAsIDApKSB7XG4gICAgICAgICAgICAgIGNsYXNzZXMucHVzaCgndG9kYXknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNsYXNzZXMuam9pbignICcpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBzZWxlY3QoZCkge1xuICAgICAgICAgICAgc2NvcGUuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLl95ZWFyLCB0aGlzLl9tb250aCwgZCk7XG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgbW9udGhDaGFuZ2Uoc2F2ZSkge1xuICAgICAgICAgICAgaWYgKHNhdmUgPT0gbnVsbCkgeyBzYXZlID0gdHJ1ZTsgfVxuXG4gICAgICAgICAgICBpZiAoKHRoaXMuX3llYXIgPT0gbnVsbCkgfHwgaXNOYU4odGhpcy5feWVhcikpIHsgdGhpcy5feWVhciA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKTsgfVxuXG4gICAgICAgICAgICBjb25zdCB7IG1pbmRhdGUgfSA9IHNjb3BlLnJlc3RyaWN0aW9ucztcbiAgICAgICAgICAgIGNvbnN0IHsgbWF4ZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xuICAgICAgICAgICAgaWYgKChtaW5kYXRlICE9IG51bGwpICYmIChtaW5kYXRlLmdldEZ1bGxZZWFyKCkgPT09IHRoaXMuX3llYXIpICYmIChtaW5kYXRlLmdldE1vbnRoKCkgPj0gdGhpcy5fbW9udGgpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX21vbnRoID0gTWF0aC5tYXgobWluZGF0ZS5nZXRNb250aCgpLCB0aGlzLl9tb250aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgobWF4ZGF0ZSAhPSBudWxsKSAmJiAobWF4ZGF0ZS5nZXRGdWxsWWVhcigpID09PSB0aGlzLl95ZWFyKSAmJiAobWF4ZGF0ZS5nZXRNb250aCgpIDw9IHRoaXMuX21vbnRoKSkge1xuICAgICAgICAgICAgICB0aGlzLl9tb250aCA9IE1hdGgubWluKG1heGRhdGUuZ2V0TW9udGgoKSwgdGhpcy5fbW9udGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzY29wZS5kYXRlLnNldEZ1bGxZZWFyKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoKTtcbiAgICAgICAgICAgIGlmIChzY29wZS5kYXRlLmdldE1vbnRoKCkgIT09IHRoaXMuX21vbnRoKSB7IHNjb3BlLmRhdGUuc2V0RGF0ZSgwKTsgfVxuXG4gICAgICAgICAgICBpZiAoKG1pbmRhdGUgIT0gbnVsbCkgJiYgKHNjb3BlLmRhdGUgPCBtaW5kYXRlKSkge1xuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldERhdGUobWluZGF0ZS5nZXRUaW1lKCkpO1xuICAgICAgICAgICAgICBzY29wZS5jYWxlbmRhci5zZWxlY3QobWluZGF0ZS5nZXREYXRlKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKG1heGRhdGUgIT0gbnVsbCkgJiYgKHNjb3BlLmRhdGUgPiBtYXhkYXRlKSkge1xuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldERhdGUobWF4ZGF0ZS5nZXRUaW1lKCkpO1xuICAgICAgICAgICAgICBzY29wZS5jYWxlbmRhci5zZWxlY3QobWF4ZGF0ZS5nZXREYXRlKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2F2ZSkgeyByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTsgfVxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBfaW5jTW9udGgobW9udGhzKSB7XG4gICAgICAgICAgICB0aGlzLl9tb250aCArPSBtb250aHM7XG4gICAgICAgICAgICB3aGlsZSAoKHRoaXMuX21vbnRoIDwgMCkgfHwgKHRoaXMuX21vbnRoID4gMTEpKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLl9tb250aCA8IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tb250aCArPSAxMjtcbiAgICAgICAgICAgICAgICB0aGlzLl95ZWFyLS07XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbW9udGggLT0gMTI7XG4gICAgICAgICAgICAgICAgdGhpcy5feWVhcisrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vbnRoQ2hhbmdlKCk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHllYXJDaGFuZ2Uoc2F2ZSkge1xuICAgICAgICAgICAgaWYgKHNhdmUgPT0gbnVsbCkgeyBzYXZlID0gdHJ1ZTsgfVxuXG4gICAgICAgICAgICBpZiAoKHNjb3BlLmNhbGVuZGFyLl95ZWFyID09IG51bGwpIHx8IChzY29wZS5jYWxlbmRhci5feWVhciA9PT0gJycpKSB7IHJldHVybjsgfVxuXG4gICAgICAgICAgICBjb25zdCB7IG1pbmRhdGUgfSA9IHNjb3BlLnJlc3RyaWN0aW9ucztcbiAgICAgICAgICAgIGNvbnN0IHsgbWF4ZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xuICAgICAgICAgICAgaSA9IChtaW5kYXRlICE9IG51bGwpICYmIChtaW5kYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNjb3BlLmNhbGVuZGFyLl95ZWFyKSA/IG1pbmRhdGUuZ2V0TW9udGgoKSA6IDA7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSAobWF4ZGF0ZSAhPSBudWxsKSAmJiAobWF4ZGF0ZS5nZXRGdWxsWWVhcigpID09PSBzY29wZS5jYWxlbmRhci5feWVhcikgPyBtYXhkYXRlLmdldE1vbnRoKCkgOiAxMTtcbiAgICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLl9tb250aHMgPSBzY29wZS5jYWxlbmRhci5fYWxsTW9udGhzLnNsaWNlKGksIGxlbiArIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmNhbGVuZGFyLm1vbnRoQ2hhbmdlKHNhdmUpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHNjb3BlLmNsb2NrID0ge1xuICAgICAgICAgIF9taW51dGVzOiAnMDAnLFxuICAgICAgICAgIF9ob3VyczogMCxcbiAgICAgICAgICBfaW5jSG91cnMoaW5jKSB7XG4gICAgICAgICAgICB0aGlzLl9ob3VycyA9IHNjb3BlLl9ob3VyczI0XG4gICAgICAgICAgPyBNYXRoLm1heCgwLCBNYXRoLm1pbigyMywgdGhpcy5faG91cnMgKyBpbmMpKVxuICAgICAgICAgIDogTWF0aC5tYXgoMSwgTWF0aC5taW4oMTIsIHRoaXMuX2hvdXJzICsgaW5jKSk7XG4gICAgICAgICAgICBpZiAoaXNOYU4odGhpcy5faG91cnMpKSB7IHJldHVybiB0aGlzLl9ob3VycyA9IDA7IH1cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgX2luY01pbnV0ZXMoaW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWludXRlcyA9IHNjb3BlLmFkZFplcm8oTWF0aC5tYXgoMCwgTWF0aC5taW4oNTksIHBhcnNlSW50KHRoaXMuX21pbnV0ZXMpICsgaW5jKSkpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHNldEFNKGIpIHtcbiAgICAgICAgICAgIGlmIChiID09IG51bGwpIHsgYiA9ICF0aGlzLmlzQU0oKTsgfVxuXG4gICAgICAgICAgICBpZiAoYiAmJiAhdGhpcy5pc0FNKCkpIHtcbiAgICAgICAgICAgICAgc2NvcGUuZGF0ZS5zZXRIb3VycyhzY29wZS5kYXRlLmdldEhvdXJzKCkgLSAxMik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFiICYmIHRoaXMuaXNBTSgpKSB7XG4gICAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0SG91cnMoc2NvcGUuZGF0ZS5nZXRIb3VycygpICsgMTIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgaXNBTSgpIHsgcmV0dXJuIHNjb3BlLmRhdGUuZ2V0SG91cnMoKSA8IDEyOyB9LFxuICAgICAgICB9O1xuICAgICAgICBzY29wZS4kd2F0Y2goJ2Nsb2NrLl9taW51dGVzJywgKHZhbCwgb2xkVmFsKSA9PiB7XG4gICAgICAgICAgaWYgKCF2YWwpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICBjb25zdCBpbnRNaW4gPSBwYXJzZUludCh2YWwpO1xuICAgICAgICAgIGlmICghaXNOYU4oaW50TWluKSAmJiBpbnRNaW4gPj0gMCAmJiBpbnRNaW4gPD0gNTkgJiYgKGludE1pbiAhPT0gc2NvcGUuZGF0ZS5nZXRNaW51dGVzKCkpKSB7XG4gICAgICAgICAgICBzY29wZS5kYXRlLnNldE1pbnV0ZXMoaW50TWluKTtcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHNjb3BlLiR3YXRjaCgnY2xvY2suX2hvdXJzJywgdmFsID0+IHtcbiAgICAgICAgICBpZiAoKHZhbCAhPSBudWxsKSAmJiAhaXNOYU4odmFsKSkge1xuICAgICAgICAgICAgaWYgKCFzY29wZS5faG91cnMyNCkge1xuICAgICAgICAgICAgICBpZiAodmFsID09PSAyNCkge1xuICAgICAgICAgICAgICAgIHZhbCA9IDEyO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbCA9PT0gMTIpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSAwO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFzY29wZS5jbG9jay5pc0FNKCkpIHsgdmFsICs9IDEyOyB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh2YWwgIT09IHNjb3BlLmRhdGUuZ2V0SG91cnMoKSkge1xuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldEhvdXJzKHZhbCk7XG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2NvcGUuc2V0Tm93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNjb3BlLnNldERhdGUoKTtcbiAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBzY29wZS5tb2RlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLl9kaXNwbGF5TW9kZSAhPSBudWxsKSB7IHNjb3BlLl9tb2RlID0gc2NvcGUuX2Rpc3BsYXlNb2RlOyB9XG5cbiAgICAgICAgICByZXR1cm4gYCR7c2NvcGUuX3ZlcnRpY2FsTW9kZSA/ICd2ZXJ0aWNhbCAnIDogJyd9JHtcbiAgICAgICAgc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAnZnVsbCcgPyAnZnVsbC1tb2RlJ1xuICAgICAgICA6IHNjb3BlLl9kaXNwbGF5TW9kZSA9PT0gJ3RpbWUnID8gJ3RpbWUtb25seSdcbiAgICAgICAgOiBzY29wZS5fZGlzcGxheU1vZGUgPT09ICdkYXRlJyA/ICdkYXRlLW9ubHknXG4gICAgICAgIDogc2NvcGUuX21vZGUgPT09ICdkYXRlJyA/ICdkYXRlLW1vZGUnXG4gICAgICAgIDogJ3RpbWUtbW9kZSd9ICR7c2NvcGUuX2NvbXBhY3QgPyAnY29tcGFjdCcgOiAnJ31gO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLm1vZGVTd2l0Y2ggPSAoKSA9PiBzY29wZS5fbW9kZSA9IHNjb3BlLl9kaXNwbGF5TW9kZSAhPSBudWxsID8gc2NvcGUuX2Rpc3BsYXlNb2RlIDogc2NvcGUuX21vZGUgPT09ICdkYXRlJyA/ICd0aW1lJyA6ICdkYXRlJztcbiAgICAgICAgcmV0dXJuIHNjb3BlLm1vZGVTd2l0Y2hUZXh0ID0gKCkgPT4gYCR7c2NEYXRlVGltZUkxOG4uc3dpdGNoVG99ICR7XG4gICAgICAgIHNjb3BlLl9tb2RlID09PSAnZGF0ZScgPyBzY0RhdGVUaW1lSTE4bi5jbG9jayA6IHNjRGF0ZVRpbWVJMThuLmNhbGVuZGFyfWA7XG4gICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9LFxuXSk7XG4iXX0=
'use strict';

angular.module('scDateTime').run(['$templateCache', function($templateCache) {

  $templateCache.put('scDateTime-bootstrap.tpl', '<div ng-class="modeClass()" class="time-date"><div ng-click="modeSwitch()" class="display"><div class="title">{{display.title()}}</div><div class="content"><div class="super-title">{{display.super()}}</div><div ng-bind-html="display.main()" class="main-title"></div><div class="sub-title">{{display.sub()}}</div></div></div><div class="control"><div class="full-title">{{display.fullTitle()}}</div><div class="slider"><div class="date-control"><div class="title"><button type="button" ng-click="calendar._incMonth(-1)" style="float: left" ng-class="{\'visuallyhidden\': calendar.isPrevMonthButtonHidden()}" class="btn btn-link"><i class="fa fa-caret-left"></i></button><span class="month-part">{{date | date:\'MMMM\'}}<select ng-model="calendar._month" ng-change="calendar.monthChange()" ng-options="calendar._allMonths.indexOf(month) as month for month in calendar._months"></select></span> <input ng-model="calendar._year" ng-change="calendar.yearChange()" type="number" min="{{restrictions.mindate ? restrictions.mindate.getFullYear() : 0}}" max="{{restrictions.maxdate ? restrictions.maxdate.getFullYear() : NaN}}" class="year-part"> <button type="button" ng-click="calendar._incMonth(1)" style="float: right" ng-class="{\'visuallyhidden\': calendar.isNextMonthButtonHidden()}" class="btn btn-link"><i class="fa fa-caret-right"></i></button></div><div class="headers"><div ng-repeat="day in _weekdays track by $index" class="day-cell">{{day}}</div></div><div class="days"><button type="button" ng-style="{\'margin-left\': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-disabled="calendar.isDisabled(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1)" class="btn btn-link day-cell">1</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-disabled="calendar.isDisabled(2)" ng-click="calendar.select(2)" class="btn btn-link day-cell">2</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-disabled="calendar.isDisabled(3)" ng-click="calendar.select(3)" class="btn btn-link day-cell">3</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-disabled="calendar.isDisabled(4)" ng-click="calendar.select(4)" class="btn btn-link day-cell">4</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-disabled="calendar.isDisabled(5)" ng-click="calendar.select(5)" class="btn btn-link day-cell">5</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-disabled="calendar.isDisabled(6)" ng-click="calendar.select(6)" class="btn btn-link day-cell">6</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-disabled="calendar.isDisabled(7)" ng-click="calendar.select(7)" class="btn btn-link day-cell">7</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-disabled="calendar.isDisabled(8)" ng-click="calendar.select(8)" class="btn btn-link day-cell">8</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-disabled="calendar.isDisabled(9)" ng-click="calendar.select(9)" class="btn btn-link day-cell">9</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-disabled="calendar.isDisabled(10)" ng-click="calendar.select(10)" class="btn btn-link day-cell">10</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-disabled="calendar.isDisabled(11)" ng-click="calendar.select(11)" class="btn btn-link day-cell">11</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-disabled="calendar.isDisabled(12)" ng-click="calendar.select(12)" class="btn btn-link day-cell">12</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-disabled="calendar.isDisabled(13)" ng-click="calendar.select(13)" class="btn btn-link day-cell">13</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-disabled="calendar.isDisabled(14)" ng-click="calendar.select(14)" class="btn btn-link day-cell">14</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-disabled="calendar.isDisabled(15)" ng-click="calendar.select(15)" class="btn btn-link day-cell">15</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-disabled="calendar.isDisabled(16)" ng-click="calendar.select(16)" class="btn btn-link day-cell">16</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-disabled="calendar.isDisabled(17)" ng-click="calendar.select(17)" class="btn btn-link day-cell">17</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-disabled="calendar.isDisabled(18)" ng-click="calendar.select(18)" class="btn btn-link day-cell">18</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-disabled="calendar.isDisabled(19)" ng-click="calendar.select(19)" class="btn btn-link day-cell">19</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-disabled="calendar.isDisabled(20)" ng-click="calendar.select(20)" class="btn btn-link day-cell">20</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-disabled="calendar.isDisabled(21)" ng-click="calendar.select(21)" class="btn btn-link day-cell">21</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-disabled="calendar.isDisabled(22)" ng-click="calendar.select(22)" class="btn btn-link day-cell">22</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-disabled="calendar.isDisabled(23)" ng-click="calendar.select(23)" class="btn btn-link day-cell">23</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-disabled="calendar.isDisabled(24)" ng-click="calendar.select(24)" class="btn btn-link day-cell">24</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-disabled="calendar.isDisabled(25)" ng-click="calendar.select(25)" class="btn btn-link day-cell">25</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-disabled="calendar.isDisabled(26)" ng-click="calendar.select(26)" class="btn btn-link day-cell">26</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-disabled="calendar.isDisabled(27)" ng-click="calendar.select(27)" class="btn btn-link day-cell">27</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-disabled="calendar.isDisabled(28)" ng-click="calendar.select(28)" class="btn btn-link day-cell">28</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-disabled="calendar.isDisabled(29)" ng-click="calendar.select(29)" class="btn btn-link day-cell">29</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-disabled="calendar.isDisabled(30)" ng-click="calendar.select(30)" class="btn btn-link day-cell">30</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-disabled="calendar.isDisabled(31)" ng-click="calendar.select(31)" class="btn btn-link day-cell">31</button><span class="event-indicator"></span></div></div><button type="button" ng-click="modeSwitch()" class="btn btn-link switch-control"><i class="fa fa-clock-o"></i><i class="fa fa-calendar"></i><span class="visuallyhidden">{{modeSwitchText()}}</span></button><div class="time-control"><div class="time-inputs"><input type="number" min="{{_hours24 ? 0 : 1}}" max="{{_hours24 ? 23 : 12}}" ng-model="clock._hours"> <button type="button" ng-click="clock._incHours(1)" class="btn btn-link hours up"><i class="fa fa-caret-up"></i></button> <button type="button" ng-click="clock._incHours(-1)" class="btn btn-link hours down"><i class="fa fa-caret-down"></i></button> <input type="text" ng-model="clock._minutes"> <button type="button" ng-click="clock._incMinutes(1)" class="btn btn-link minutes up"><i class="fa fa-caret-up"></i></button> <button type="button" ng-click="clock._incMinutes(-1)" class="btn btn-link minutes down"><i class="fa fa-caret-down"></i></button></div><div ng-if="!_hours24" class="buttons"><button type="button" ng-click="clock.setAM()" class="btn btn-link">{{date | date:\'a\'}}</button></div></div></div></div><div class="buttons"><button type="button" ng-click="setNow()" class="btn btn-link">{{:: translations.now}}</button> <button type="button" ng-click="cancel()" ng-if="!autosave" class="btn btn-link">{{:: translations.cancel}}</button> <button type="button" ng-click="save()" ng-if="!autosave" class="btn btn-link">{{:: translations.save}}</button></div></div>');

}]);
'use strict';

angular.module('scDateTime').run(['$templateCache', function($templateCache) {

  $templateCache.put('scDateTime-material.tpl', '<div ng-class="modeClass()" class="time-date"><div ng-click="modeSwitch()" aria-label="{{modeSwitchText()}}" class="display"><div class="title">{{display.title()}}</div><div class="content"><div class="super-title">{{display.super()}}</div><div ng-bind-html="display.main()" class="main-title"></div><div class="sub-title">{{display.sub()}}</div></div></div><div class="control"><div class="full-title">{{display.fullTitle()}}</div><div class="slider"><div class="date-control"><div class="title"><md-button type="button" ng-click="calendar._incMonth(-1)" aria-label="{{:: translations.previousMonth}}" style="float: left" ng-class="{\'visuallyhidden\': calendar.isPrevMonthButtonHidden()}"><i class="fa fa-caret-left"></i></md-button><span class="month-part">{{date | date:\'MMMM\'}}<select ng-model="calendar._month" ng-change="calendar.monthChange()" ng-options="calendar._allMonths.indexOf(month) as month for month in calendar._months"></select></span> <input ng-model="calendar._year" ng-change="calendar.yearChange()" type="number" min="{{restrictions.mindate ? restrictions.mindate.getFullYear() : 0}}" max="{{restrictions.maxdate ? restrictions.maxdate.getFullYear() : NaN}}" class="year-part"><md-button type="button" ng-click="calendar._incMonth(1)" aria-label="{{:: translations.nextMonth}}" style="float: right" ng-class="{\'visuallyhidden\': calendar.isNextMonthButtonHidden()}"><i class="fa fa-caret-right"></i></md-button></div><div class="headers"><div ng-repeat="day in _weekdays track by $index" class="day-cell">{{day}}</div></div><div class="days"><md-button type="button" ng-style="{\'margin-left\': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-disabled="calendar.isDisabled(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1)" aria-label="1" class="day-cell">1<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-disabled="calendar.isDisabled(2)" ng-click="calendar.select(2)" aria-label="2" class="day-cell">2<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-disabled="calendar.isDisabled(3)" ng-click="calendar.select(3)" aria-label="3" class="day-cell">3<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-disabled="calendar.isDisabled(4)" ng-click="calendar.select(4)" aria-label="4" class="day-cell">4<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-disabled="calendar.isDisabled(5)" ng-click="calendar.select(5)" aria-label="5" class="day-cell">5<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-disabled="calendar.isDisabled(6)" ng-click="calendar.select(6)" aria-label="6" class="day-cell">6<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-disabled="calendar.isDisabled(7)" ng-click="calendar.select(7)" aria-label="7" class="day-cell">7<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-disabled="calendar.isDisabled(8)" ng-click="calendar.select(8)" aria-label="8" class="day-cell">8<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-disabled="calendar.isDisabled(9)" ng-click="calendar.select(9)" aria-label="9" class="day-cell">9<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-disabled="calendar.isDisabled(10)" ng-click="calendar.select(10)" aria-label="10" class="day-cell">10<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-disabled="calendar.isDisabled(11)" ng-click="calendar.select(11)" aria-label="11" class="day-cell">11<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-disabled="calendar.isDisabled(12)" ng-click="calendar.select(12)" aria-label="12" class="day-cell">12<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-disabled="calendar.isDisabled(13)" ng-click="calendar.select(13)" aria-label="13" class="day-cell">13<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-disabled="calendar.isDisabled(14)" ng-click="calendar.select(14)" aria-label="14" class="day-cell">14<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-disabled="calendar.isDisabled(15)" ng-click="calendar.select(15)" aria-label="15" class="day-cell">15<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-disabled="calendar.isDisabled(16)" ng-click="calendar.select(16)" aria-label="16" class="day-cell">16<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-disabled="calendar.isDisabled(17)" ng-click="calendar.select(17)" aria-label="17" class="day-cell">17<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-disabled="calendar.isDisabled(18)" ng-click="calendar.select(18)" aria-label="18" class="day-cell">18<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-disabled="calendar.isDisabled(19)" ng-click="calendar.select(19)" aria-label="19" class="day-cell">19<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-disabled="calendar.isDisabled(20)" ng-click="calendar.select(20)" aria-label="20" class="day-cell">20<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-disabled="calendar.isDisabled(21)" ng-click="calendar.select(21)" aria-label="21" class="day-cell">21<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-disabled="calendar.isDisabled(22)" ng-click="calendar.select(22)" aria-label="22" class="day-cell">22<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-disabled="calendar.isDisabled(23)" ng-click="calendar.select(23)" aria-label="23" class="day-cell">23<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-disabled="calendar.isDisabled(24)" ng-click="calendar.select(24)" aria-label="24" class="day-cell">24<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-disabled="calendar.isDisabled(25)" ng-click="calendar.select(25)" aria-label="25" class="day-cell">25<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-disabled="calendar.isDisabled(26)" ng-click="calendar.select(26)" aria-label="26" class="day-cell">26<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-disabled="calendar.isDisabled(27)" ng-click="calendar.select(27)" aria-label="27" class="day-cell">27<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-disabled="calendar.isDisabled(28)" ng-click="calendar.select(28)" aria-label="28" class="day-cell">28<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-disabled="calendar.isDisabled(29)" ng-click="calendar.select(29)" aria-label="29" class="day-cell">29<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-disabled="calendar.isDisabled(30)" ng-click="calendar.select(30)" aria-label="30" class="day-cell">30<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-disabled="calendar.isDisabled(31)" ng-click="calendar.select(31)" aria-label="31" class="day-cell">31<span class="event-indicator"></span></md-button></div></div><md-button type="button" ng-click="modeSwitch()" aria-label="{{modeSwitchText()}}" class="switch-control"><i class="fa fa-clock-o"></i><i class="fa fa-calendar"></i><span class="visuallyhidden">{{modeSwitchText()}}</span></md-button><div class="time-control"><div class="time-inputs"><input type="number" min="{{_hours24 ? 0 : 1}}" max="{{_hours24 ? 23 : 12}}" ng-model="clock._hours"><md-button type="button" ng-click="clock._incHours(1)" aria-label="{{:: translations.incrementHours}}" class="hours up"><i class="fa fa-caret-up"></i></md-button><md-button type="button" ng-click="clock._incHours(-1)" aria-label="{{:: translations.decrementHours}}" class="hours down"><i class="fa fa-caret-down"></i></md-button><input type="text" ng-model="clock._minutes"><md-button type="button" ng-click="clock._incMinutes(1)" aria-label="{{:: translations.incrementMinutes}}" class="minutes up"><i class="fa fa-caret-up"></i></md-button><md-button type="button" ng-click="clock._incMinutes(-1)" aria-label="{{:: translations.decrementMinutes}}" class="minutes down"><i class="fa fa-caret-down"></i></md-button></div><div ng-if="!_hours24" class="buttons"><md-button type="button" ng-click="clock.setAM()" aria-label="{{:: translations.switchAmPm}}">{{date | date:\'a\'}}</md-button></div></div></div></div><div class="buttons"><md-button type="button" ng-click="setNow()" aria-label="{{:: translations.now}}">{{:: translations.now}}</md-button><md-button type="button" ng-click="cancel()" ng-if="!autosave" aria-label="{{:: translations.cancel}}">{{:: translations.cancel}}</md-button><md-button type="button" ng-click="save()" ng-if="!autosave" aria-label="{{:: translations.save}}">{{:: translations.save}}</md-button></div></div>');

}]);