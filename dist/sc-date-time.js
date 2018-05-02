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
              var dateString = this._year + '-' + ('0' + (this._month + 1)).slice(-2) + '-' + ('0' + d).slice(-2),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiTU9EVUxFX05BTUUiLCJtb2R1bGUiLCJ2YWx1ZSIsImRlZmF1bHRUaGVtZSIsImF1dG9zYXZlIiwiZGVmYXVsdE1vZGUiLCJkZWZhdWx0RGF0ZSIsInVuZGVmaW5lZCIsImRpc3BsYXlNb2RlIiwiZGVmYXVsdE9yaWVudGF0aW9uIiwiZGlzcGxheVR3ZW50eWZvdXIiLCJjb21wYWN0IiwiZXZlbnRzIiwiZXZlbnRNYXhTY29yZSIsInByZXZpb3VzTW9udGgiLCJuZXh0TW9udGgiLCJpbmNyZW1lbnRIb3VycyIsImRlY3JlbWVudEhvdXJzIiwiaW5jcmVtZW50TWludXRlcyIsImRlY3JlbWVudE1pbnV0ZXMiLCJzd2l0Y2hBbVBtIiwibm93IiwiY2FuY2VsIiwic2F2ZSIsIndlZWtkYXlzIiwic3dpdGNoVG8iLCJjbG9jayIsImNhbGVuZGFyIiwiZGlyZWN0aXZlIiwiJGZpbHRlciIsIiRzY2UiLCIkcm9vdFNjb3BlIiwiJHBhcnNlIiwic2NEYXRlVGltZUkxOG4iLCJzY0RhdGVUaW1lQ29uZmlnIiwiX2RhdGVGaWx0ZXIiLCJyZXN0cmljdCIsInJlcGxhY2UiLCJzY29wZSIsIl93ZWVrZGF5cyIsIl9ldmVudHMiLCJfZXZlbnRNYXhTY29yZSIsInJlcXVpcmUiLCJ0ZW1wbGF0ZVVybCIsInRFbGVtZW50IiwidEF0dHJzIiwidGhlbWUiLCJpbmRleE9mIiwibGluayIsImVsZW1lbnQiLCJhdHRycyIsIm5nTW9kZWwiLCIkb2JzZXJ2ZSIsInZhbCIsIl9tb2RlIiwiX2RlZmF1bHREYXRlIiwiRGF0ZSIsInBhcnNlIiwiX2Rpc3BsYXlNb2RlIiwiX3ZlcnRpY2FsTW9kZSIsIl9jb21wYWN0IiwiX2hvdXJzMjQiLCJyZXN0cmljdGlvbnMiLCJtaW5kYXRlIiwic2V0SG91cnMiLCJtYXhkYXRlIiwiJHdhdGNoIiwiaXNBcnJheSIsIiRyZW5kZXIiLCJzZXREYXRlIiwiJG1vZGVsVmFsdWUiLCJmb3JFYWNoIiwiZmluZCIsImlucHV0Iiwib24iLCJzZXRUaW1lb3V0Iiwic2VsZWN0Iiwic2F2ZVVwZGF0ZURhdGUiLCIkc2V0Vmlld1ZhbHVlIiwiZGF0ZSIsInNhdmVGbiIsIm9uU2F2ZSIsImNhbmNlbEZuIiwib25DYW5jZWwiLCIkcGFyZW50IiwiJHZhbHVlIiwiY29udHJvbGxlciIsImkiLCJ0cmFuc2xhdGlvbnMiLCJhZGRaZXJvIiwibWluIiwidG9TdHJpbmciLCJzbGljZSIsIm5ld1ZhbCIsIl95ZWFyIiwiZ2V0RnVsbFllYXIiLCJfbW9udGgiLCJnZXRNb250aCIsIl9taW51dGVzIiwiZ2V0TWludXRlcyIsIl9ob3VycyIsImdldEhvdXJzIiwieWVhckNoYW5nZSIsImRpc3BsYXkiLCJmdWxsVGl0bGUiLCJfdGltZVN0cmluZyIsInRpdGxlIiwic3VwZXIiLCJtYWluIiwidHJ1c3RBc0h0bWwiLCJzdWIiLCJfbW9udGhzIiwiX2FsbE1vbnRocyIsInJlc3VsdCIsInB1c2giLCJvZmZzZXRNYXJnaW4iLCJnZXREYXkiLCJpc1Zpc2libGUiLCJkIiwiaXNEaXNhYmxlZCIsImN1cnJlbnREYXRlIiwiaXNQcmV2TW9udGhCdXR0b25IaWRkZW4iLCJpc05leHRNb250aEJ1dHRvbkhpZGRlbiIsImNsYXNzIiwiY2xhc3NlcyIsImdldFRpbWUiLCJkYXRlU3RyaW5nIiwic2NvcmUiLCJqb2luIiwic2V0RnVsbFllYXIiLCJtb250aENoYW5nZSIsImlzTmFOIiwiTWF0aCIsIm1heCIsImdldERhdGUiLCJfaW5jTW9udGgiLCJtb250aHMiLCJsZW4iLCJfaW5jSG91cnMiLCJpbmMiLCJfaW5jTWludXRlcyIsInBhcnNlSW50Iiwic2V0QU0iLCJiIiwiaXNBTSIsIm9sZFZhbCIsImludE1pbiIsInNldE1pbnV0ZXMiLCJzZXROb3ciLCJtb2RlQ2xhc3MiLCJtb2RlU3dpdGNoIiwibW9kZVN3aXRjaFRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLE1BQU1BLGNBQWMsWUFBcEI7O29CQUVlQSxX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QSxlQUFPaEIsTUFBTWlILGNBQU4sR0FBdUI7QUFBQSxpQkFBU3RILGVBQWVSLFFBQXhCLFVBQzlCYSxNQUFNZ0IsS0FBTixLQUFnQixNQUFoQixHQUF5QnJCLGVBQWVQLEtBQXhDLEdBQWdETyxlQUFlTixRQURqQztBQUFBLFNBQTlCO0FBRUQsT0FwUlc7QUFyRlAsS0FBUDtBQTRXRCxHQS9XMkIsQ0E3QjlCIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcblxuY29uc3QgTU9EVUxFX05BTUUgPSAnc2NEYXRlVGltZSc7XG5cbmV4cG9ydCBkZWZhdWx0IE1PRFVMRV9OQU1FO1xuXG5hbmd1bGFyLm1vZHVsZShNT0RVTEVfTkFNRSwgW10pXG4udmFsdWUoJ3NjRGF0ZVRpbWVDb25maWcnLCB7XG4gIGRlZmF1bHRUaGVtZTogJ21hdGVyaWFsJyxcbiAgYXV0b3NhdmU6IGZhbHNlLFxuICBkZWZhdWx0TW9kZTogJ2RhdGUnLFxuICBkZWZhdWx0RGF0ZTogdW5kZWZpbmVkLCAvLyBzaG91bGQgYmUgZGF0ZSBvYmplY3QhIVxuICBkaXNwbGF5TW9kZTogdW5kZWZpbmVkLFxuICBkZWZhdWx0T3JpZW50YXRpb246IGZhbHNlLFxuICBkaXNwbGF5VHdlbnR5Zm91cjogZmFsc2UsXG4gIGNvbXBhY3Q6IGZhbHNlLFxuICBldmVudHM6IFtdLFxuICBldmVudE1heFNjb3JlOiAwXG59LFxuKS52YWx1ZSgnc2NEYXRlVGltZUkxOG4nLCB7XG4gIHByZXZpb3VzTW9udGg6ICdQcmV2aW91cyBNb250aCcsXG4gIG5leHRNb250aDogJ05leHQgTW9udGgnLFxuICBpbmNyZW1lbnRIb3VyczogJ0luY3JlbWVudCBIb3VycycsXG4gIGRlY3JlbWVudEhvdXJzOiAnRGVjcmVtZW50IEhvdXJzJyxcbiAgaW5jcmVtZW50TWludXRlczogJ0luY3JlbWVudCBNaW51dGVzJyxcbiAgZGVjcmVtZW50TWludXRlczogJ0RlY3JlbWVudCBNaW51dGVzJyxcbiAgc3dpdGNoQW1QbTogJ1N3aXRjaCBBTS9QTScsXG4gIG5vdzogJ05vdycsXG4gIGNhbmNlbDogJ0NhbmNlbCcsXG4gIHNhdmU6ICdTYXZlJyxcbiAgd2Vla2RheXM6IFsnUycsICdNJywgJ1QnLCAnVycsICdUJywgJ0YnLCAnUyddLFxuICBzd2l0Y2hUbzogJ1N3aXRjaCB0bycsXG4gIGNsb2NrOiAnQ2xvY2snLFxuICBjYWxlbmRhcjogJ0NhbGVuZGFyJyxcbn0sXG4pLmRpcmVjdGl2ZSgndGltZURhdGVQaWNrZXInLCBbJyRmaWx0ZXInLCAnJHNjZScsICckcm9vdFNjb3BlJywgJyRwYXJzZScsICdzY0RhdGVUaW1lSTE4bicsICdzY0RhdGVUaW1lQ29uZmlnJyxcbiAgZnVuY3Rpb24gKCRmaWx0ZXIsICRzY2UsICRyb290U2NvcGUsICRwYXJzZSwgc2NEYXRlVGltZUkxOG4sIHNjRGF0ZVRpbWVDb25maWcpIHtcbiAgICBjb25zdCBfZGF0ZUZpbHRlciA9ICRmaWx0ZXIoJ2RhdGUnKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgX3dlZWtkYXlzOiAnPT90ZFdlZWtkYXlzJyxcbiAgICAgICAgX2V2ZW50czogJz0/ZXZlbnRzJyxcbiAgICAgICAgX2V2ZW50TWF4U2NvcmU6ICc9P2V2ZW50TWF4U2NvcmUnXG4gICAgICB9LFxuICAgICAgcmVxdWlyZTogJ25nTW9kZWwnLFxuICAgICAgdGVtcGxhdGVVcmwodEVsZW1lbnQsIHRBdHRycykge1xuICAgICAgICBpZiAoKHRBdHRycy50aGVtZSA9PSBudWxsKSB8fCAodEF0dHJzLnRoZW1lID09PSAnJykpIHsgdEF0dHJzLnRoZW1lID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0VGhlbWU7IH1cblxuICAgICAgICByZXR1cm4gdEF0dHJzLnRoZW1lLmluZGV4T2YoJy8nKSA8PSAwID8gYHNjRGF0ZVRpbWUtJHt0QXR0cnMudGhlbWV9LnRwbGAgOiB0QXR0cnMudGhlbWU7XG4gICAgICB9LFxuXG4gICAgICBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbCkge1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnZGVmYXVsdE1vZGUnLCB2YWwgPT4ge1xuICAgICAgICAgIGlmICgodmFsICE9PSAndGltZScpICYmICh2YWwgIT09ICdkYXRlJykpIHsgdmFsID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0TW9kZTsgfVxuXG4gICAgICAgICAgcmV0dXJuIHNjb3BlLl9tb2RlID0gdmFsO1xuICAgICAgICB9KTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2RlZmF1bHREYXRlJywgdmFsID0+XG4gICAgICAgIHNjb3BlLl9kZWZhdWx0RGF0ZSA9ICh2YWwgIT0gbnVsbCkgJiYgRGF0ZS5wYXJzZSh2YWwpID8gRGF0ZS5wYXJzZSh2YWwpXG4gICAgICAgIDogc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0RGF0ZSxcbiAgICAgICk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdkaXNwbGF5TW9kZScsIHZhbCA9PiB7XG4gICAgICAgICAgaWYgKCh2YWwgIT09ICdmdWxsJykgJiYgKHZhbCAhPT0gJ3RpbWUnKSAmJiAodmFsICE9PSAnZGF0ZScpKSB7IHZhbCA9IHNjRGF0ZVRpbWVDb25maWcuZGlzcGxheU1vZGU7IH1cblxuICAgICAgICAgIHJldHVybiBzY29wZS5fZGlzcGxheU1vZGUgPSB2YWw7XG4gICAgICAgIH0pO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnb3JpZW50YXRpb24nLCB2YWwgPT4gc2NvcGUuX3ZlcnRpY2FsTW9kZSA9ICh2YWwgIT0gbnVsbCkgPyB2YWwgPT09ICd0cnVlJyA6IHNjRGF0ZVRpbWVDb25maWcuZGVmYXVsdE9yaWVudGF0aW9uKTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2NvbXBhY3QnLCB2YWwgPT4gc2NvcGUuX2NvbXBhY3QgPSAodmFsICE9IG51bGwpID8gdmFsID09PSAndHJ1ZScgOiBzY0RhdGVUaW1lQ29uZmlnLmNvbXBhY3QpO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnZGlzcGxheVR3ZW50eWZvdXInLCB2YWwgPT4gc2NvcGUuX2hvdXJzMjQgPSAodmFsICE9IG51bGwpID8gdmFsIDogc2NEYXRlVGltZUNvbmZpZy5kaXNwbGF5VHdlbnR5Zm91cik7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdtaW5kYXRlJywgdmFsID0+IHtcbiAgICAgICAgICBpZiAoKHZhbCAhPSBudWxsKSAmJiBEYXRlLnBhcnNlKHZhbCkpIHtcbiAgICAgICAgICAgIHNjb3BlLnJlc3RyaWN0aW9ucy5taW5kYXRlID0gbmV3IERhdGUodmFsKTtcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5yZXN0cmljdGlvbnMubWluZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnbWF4ZGF0ZScsIHZhbCA9PiB7XG4gICAgICAgICAgaWYgKCh2YWwgIT0gbnVsbCkgJiYgRGF0ZS5wYXJzZSh2YWwpKSB7XG4gICAgICAgICAgICBzY29wZS5yZXN0cmljdGlvbnMubWF4ZGF0ZSA9IG5ldyBEYXRlKHZhbCk7XG4gICAgICAgICAgICByZXR1cm4gc2NvcGUucmVzdHJpY3Rpb25zLm1heGRhdGUuc2V0SG91cnMoMjMsIDU5LCA1OSwgOTk5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNjb3BlLl93ZWVrZGF5cyA9IHNjb3BlLl93ZWVrZGF5cyB8fCBzY0RhdGVUaW1lSTE4bi53ZWVrZGF5cztcbiAgICAgICAgc2NvcGUuJHdhdGNoKCdfd2Vla2RheXMnLCB2YWx1ZSA9PiB7XG4gICAgICAgICAgaWYgKCh2YWx1ZSA9PSBudWxsKSB8fCAhYW5ndWxhci5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLl93ZWVrZGF5cyA9IHNjRGF0ZVRpbWVJMThuLndlZWtkYXlzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2NvcGUuX2V2ZW50cyA9IHNjb3BlLl9ldmVudHMgfHwgc2NEYXRlVGltZUkxOG4uZXZlbnRzOyAgICAgICAgXG4gICAgICAgIHNjb3BlLl9ldmVudE1heFNjb3JlID0gc2NvcGUuX2V2ZW50TWF4U2NvcmUgfHwgc2NEYXRlVGltZUkxOG4uZXZlbnRNYXhTY29yZTsgXG5cbiAgICAgICAgbmdNb2RlbC4kcmVuZGVyID0gKCkgPT4gc2NvcGUuc2V0RGF0ZShuZ01vZGVsLiRtb2RlbFZhbHVlICE9IG51bGwgPyBuZ01vZGVsLiRtb2RlbFZhbHVlIDogc2NvcGUuX2RlZmF1bHREYXRlLCAobmdNb2RlbC4kbW9kZWxWYWx1ZSAhPSBudWxsKSk7XG5cbiAgICAgICAgLy8gU2VsZWN0IGNvbnRlbnRzIG9mIGlucHV0cyB3aGVuIGZvY2N1c3NlZCBpbnRvXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChlbGVtZW50LmZpbmQoJ2lucHV0JyksXG4gICAgICAgIGlucHV0ID0+XG4gICAgICAgICAgYW5ndWxhci5lbGVtZW50KGlucHV0KS5vbignZm9jdXMnLCAoKSA9PiBzZXRUaW1lb3V0KCgoKSA9PiBpbnB1dC5zZWxlY3QoKSksIDEwKSksXG4gICAgICApO1xuXG4gICAgICAgIHNjb3BlLmF1dG9zYXZlID0gZmFsc2U7XG4gICAgICAgIGlmICgoYXR0cnMuYXV0b3NhdmUgIT0gbnVsbCkgfHwgc2NEYXRlVGltZUNvbmZpZy5hdXRvc2F2ZSkge1xuICAgICAgICAgIHNjb3BlLnNhdmVVcGRhdGVEYXRlID0gKCkgPT4gbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKHNjb3BlLmRhdGUpO1xuICAgICAgICAgIHJldHVybiBzY29wZS5hdXRvc2F2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzYXZlRm4gPSAkcGFyc2UoYXR0cnMub25TYXZlKTtcbiAgICAgICAgY29uc3QgY2FuY2VsRm4gPSAkcGFyc2UoYXR0cnMub25DYW5jZWwpO1xuICAgICAgICBzY29wZS5zYXZlVXBkYXRlRGF0ZSA9ICgpID0+IHRydWU7XG5cbiAgICAgICAgc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBuZ01vZGVsLiRzZXRWaWV3VmFsdWUobmV3IERhdGUoc2NvcGUuZGF0ZSkpO1xuICAgICAgICAgIHJldHVybiBzYXZlRm4oc2NvcGUuJHBhcmVudCwgeyAkdmFsdWU6IG5ldyBEYXRlKHNjb3BlLmRhdGUpIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2FuY2VsRm4oc2NvcGUuJHBhcmVudCwge30pO1xuICAgICAgICAgIHJldHVybiBuZ01vZGVsLiRyZW5kZXIoKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJ3NjRGF0ZVRpbWVJMThuJywgZnVuY3Rpb24gKHNjb3BlLCBzY0RhdGVUaW1lSTE4bikge1xuICAgICAgICBsZXQgaTtcbiAgICAgICAgc2NvcGUuX2RlZmF1bHREYXRlID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0RGF0ZTtcbiAgICAgICAgc2NvcGUuX21vZGUgPSBzY0RhdGVUaW1lQ29uZmlnLmRlZmF1bHRNb2RlO1xuICAgICAgICBzY29wZS5fZGlzcGxheU1vZGUgPSBzY0RhdGVUaW1lQ29uZmlnLmRpc3BsYXlNb2RlO1xuICAgICAgICBzY29wZS5fdmVydGljYWxNb2RlID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0T3JpZW50YXRpb247XG4gICAgICAgIHNjb3BlLl9ob3VyczI0ID0gc2NEYXRlVGltZUNvbmZpZy5kaXNwbGF5VHdlbnR5Zm91cjtcbiAgICAgICAgc2NvcGUuX2NvbXBhY3QgPSBzY0RhdGVUaW1lQ29uZmlnLmNvbXBhY3Q7XG4gICAgICAgIHNjb3BlLnRyYW5zbGF0aW9ucyA9IHNjRGF0ZVRpbWVJMThuO1xuICAgICAgICBzY29wZS5yZXN0cmljdGlvbnMgPSB7XG4gICAgICAgICAgbWluZGF0ZTogdW5kZWZpbmVkLFxuICAgICAgICAgIG1heGRhdGU6IHVuZGVmaW5lZCxcbiAgICAgICAgfTtcblxuICAgICAgICBzY29wZS5hZGRaZXJvID0gZnVuY3Rpb24gKG1pbikge1xuICAgICAgICAgIGlmIChtaW4gPiA5KSB7IHJldHVybiBtaW4udG9TdHJpbmcoKTsgfSByZXR1cm4gKGAwJHttaW59YCkuc2xpY2UoLTIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLnNldERhdGUgPSBmdW5jdGlvbiAobmV3VmFsLCBzYXZlKSB7XG4gICAgICAgICAgaWYgKHNhdmUgPT0gbnVsbCkgeyBzYXZlID0gdHJ1ZTsgfVxuXG4gICAgICAgICAgc2NvcGUuZGF0ZSA9IG5ld1ZhbCA/IG5ldyBEYXRlKG5ld1ZhbCkgOiBuZXcgRGF0ZSgpO1xuICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLl95ZWFyID0gc2NvcGUuZGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLl9tb250aCA9IHNjb3BlLmRhdGUuZ2V0TW9udGgoKTtcbiAgICAgICAgICBzY29wZS5jbG9jay5fbWludXRlcyA9IHNjb3BlLmFkZFplcm8oc2NvcGUuZGF0ZS5nZXRNaW51dGVzKCkpO1xuICAgICAgICAgIHNjb3BlLmNsb2NrLl9ob3VycyA9IHNjb3BlLl9ob3VyczI0ID8gc2NvcGUuZGF0ZS5nZXRIb3VycygpIDogc2NvcGUuZGF0ZS5nZXRIb3VycygpICUgMTI7XG4gICAgICAgICAgaWYgKCFzY29wZS5faG91cnMyNCAmJiAoc2NvcGUuY2xvY2suX2hvdXJzID09PSAwKSkgeyBzY29wZS5jbG9jay5faG91cnMgPSAxMjsgfVxuXG4gICAgICAgICAgcmV0dXJuIHNjb3BlLmNhbGVuZGFyLnllYXJDaGFuZ2Uoc2F2ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc2NvcGUuZGlzcGxheSA9IHtcbiAgICAgICAgICBmdWxsVGl0bGUoKSB7XG4gICAgICAgICAgICBjb25zdCBfdGltZVN0cmluZyA9IHNjb3BlLl9ob3VyczI0ID8gJ0hIOm1tJyA6ICdoOm1tIGEnO1xuICAgICAgICAgICAgaWYgKChzY29wZS5fZGlzcGxheU1vZGUgPT09ICdmdWxsJykgJiYgIXNjb3BlLl92ZXJ0aWNhbE1vZGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsIGBFRUVFIGQgTU1NTSB5eXl5LCAke190aW1lU3RyaW5nfWApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzY29wZS5fZGlzcGxheU1vZGUgPT09ICd0aW1lJykge1xuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgX3RpbWVTdHJpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzY29wZS5fZGlzcGxheU1vZGUgPT09ICdkYXRlJykge1xuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ0VFRSBkIE1NTSB5eXl5Jyk7XG4gICAgICAgICAgICB9IHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCBgZCBNTU0geXl5eSwgJHtfdGltZVN0cmluZ31gKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgdGl0bGUoKSB7XG4gICAgICAgICAgICBpZiAoc2NvcGUuX21vZGUgPT09ICdkYXRlJykge1xuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgKHNjb3BlLl9kaXNwbGF5TW9kZSA9PT0gJ2RhdGUnID8gJ0VFRUUnIDogYEVFRUUgJHtcbiAgICAgICAgICAgICAgc2NvcGUuX2hvdXJzMjQgPyAnSEg6bW0nIDogJ2g6bW0gYSdcbiAgICAgICAgICAgIH1gKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnTU1NTSBkIHl5eXknKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgc3VwZXIoKSB7XG4gICAgICAgICAgICBpZiAoc2NvcGUuX21vZGUgPT09ICdkYXRlJykge1xuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ01NTScpO1xuICAgICAgICAgICAgfSByZXR1cm4gJyc7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIG1haW4oKSB7XG4gICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbChcbiAgICAgICAgICBzY29wZS5fbW9kZSA9PT0gJ2RhdGUnID8gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ2QnKVxuICAgICAgICAgIDpcbiAgICAgICAgICAgIHNjb3BlLl9ob3VyczI0ID8gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ0hIOm1tJylcbiAgICAgICAgICAgIDogYCR7X2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ2g6bW0nKX08c21hbGw+JHtfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnYScpfTwvc21hbGw+YCxcbiAgICAgICAgKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgc3ViKCkge1xuICAgICAgICAgICAgaWYgKHNjb3BlLl9tb2RlID09PSAnZGF0ZScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICd5eXl5Jyk7XG4gICAgICAgICAgICB9IHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnSEg6bW0nKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLmNhbGVuZGFyID0ge1xuICAgICAgICAgIF9tb250aDogMCxcbiAgICAgICAgICBfeWVhcjogMCxcbiAgICAgICAgICBfbW9udGhzOiBbXSxcbiAgICAgICAgICBfYWxsTW9udGhzOiAoKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8PSAxMTsgaSsrKSB7XG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKF9kYXRlRmlsdGVyKG5ldyBEYXRlKDAsIGkpLCAnTU1NTScpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9KSgpKSxcbiAgICAgICAgICBvZmZzZXRNYXJnaW4oKSB7IHJldHVybiBgJHtuZXcgRGF0ZSh0aGlzLl95ZWFyLCB0aGlzLl9tb250aCkuZ2V0RGF5KCkgKiAyLjd9cmVtYDsgfSxcblxuICAgICAgICAgIGlzVmlzaWJsZShkKSB7IHJldHVybiBuZXcgRGF0ZSh0aGlzLl95ZWFyLCB0aGlzLl9tb250aCwgZCkuZ2V0TW9udGgoKSA9PT0gdGhpcy5fbW9udGg7IH0sXG5cbiAgICAgICAgICBpc0Rpc2FibGVkKGQpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREYXRlID0gbmV3IERhdGUodGhpcy5feWVhciwgdGhpcy5fbW9udGgsIGQpO1xuICAgICAgICAgICAgY29uc3QgeyBtaW5kYXRlIH0gPSBzY29wZS5yZXN0cmljdGlvbnM7XG4gICAgICAgICAgICBjb25zdCB7IG1heGRhdGUgfSA9IHNjb3BlLnJlc3RyaWN0aW9ucztcbiAgICAgICAgICAgIHJldHVybiAoKG1pbmRhdGUgIT0gbnVsbCkgJiYgKGN1cnJlbnREYXRlIDwgbWluZGF0ZSkpIHx8ICgobWF4ZGF0ZSAhPSBudWxsKSAmJiAoY3VycmVudERhdGUgPiBtYXhkYXRlKSk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGlzUHJldk1vbnRoQnV0dG9uSGlkZGVuKCkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHNjb3BlLnJlc3RyaWN0aW9ucy5taW5kYXRlO1xuICAgICAgICAgICAgcmV0dXJuIChkYXRlICE9IG51bGwpICYmICh0aGlzLl9tb250aCA8PSBkYXRlLmdldE1vbnRoKCkpICYmICh0aGlzLl95ZWFyIDw9IGRhdGUuZ2V0RnVsbFllYXIoKSk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGlzTmV4dE1vbnRoQnV0dG9uSGlkZGVuKCkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHNjb3BlLnJlc3RyaWN0aW9ucy5tYXhkYXRlO1xuICAgICAgICAgICAgcmV0dXJuIChkYXRlICE9IG51bGwpICYmICh0aGlzLl9tb250aCA+PSBkYXRlLmdldE1vbnRoKCkpICYmICh0aGlzLl95ZWFyID49IGRhdGUuZ2V0RnVsbFllYXIoKSk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGNsYXNzKGQpIHtcbiAgICAgICAgICAgIGxldCBjbGFzc2VzID0gW107XG4gICAgICAgICAgICBpZiAoKHNjb3BlLmRhdGUgIT0gbnVsbCkgJiYgKG5ldyBEYXRlKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoLCBkKS5nZXRUaW1lKCkgPT09IG5ldyBEYXRlKHNjb3BlLmRhdGUuZ2V0VGltZSgpKS5zZXRIb3VycygwLFxuICAgICAgICAgICAgMCwgMCwgMCkpKSB7XG4gICAgICAgICAgICAgIGNsYXNzZXMucHVzaCgnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNjb3BlLl9ldmVudE1heFNjb3JlICE9PSAwKSB7ICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgdmFyIGRhdGVTdHJpbmcgPSB0aGlzLl95ZWFyICsgJy0nICsgKCcwJyArICh0aGlzLl9tb250aCArIDEpKS5zbGljZSgtMikgKyAnLScgKyAoJzAnICsgZCkuc2xpY2UoLTIpLFxuICAgICAgICAgICAgICAgIHNjb3JlID0gc2NvcGUuX2V2ZW50c1tkYXRlU3RyaW5nXSAvIHNjb3BlLl9ldmVudE1heFNjb3JlO1xuXG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBpZiAoc2NvcmUpIHtcbiAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2goJ2V2ZW50Jyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2NvcmUgPiAwLjkpIHtcbiAgICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaCgnZXZlbnQtaGlnaCcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzY29yZSA8IDAuNSkge1xuICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCdldmVudC1sb3cnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5ldyBEYXRlKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoLCBkKS5nZXRUaW1lKCkgPT09IG5ldyBEYXRlKCkuc2V0SG91cnMoMCwgMCwgMCwgMCkpIHtcbiAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCd0b2RheScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY2xhc3Nlcy5qb2luKCcgJyk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHNlbGVjdChkKSB7XG4gICAgICAgICAgICBzY29wZS5kYXRlLnNldEZ1bGxZZWFyKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoLCBkKTtcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBtb250aENoYW5nZShzYXZlKSB7XG4gICAgICAgICAgICBpZiAoc2F2ZSA9PSBudWxsKSB7IHNhdmUgPSB0cnVlOyB9XG5cbiAgICAgICAgICAgIGlmICgodGhpcy5feWVhciA9PSBudWxsKSB8fCBpc05hTih0aGlzLl95ZWFyKSkgeyB0aGlzLl95ZWFyID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpOyB9XG5cbiAgICAgICAgICAgIGNvbnN0IHsgbWluZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xuICAgICAgICAgICAgY29uc3QgeyBtYXhkYXRlIH0gPSBzY29wZS5yZXN0cmljdGlvbnM7XG4gICAgICAgICAgICBpZiAoKG1pbmRhdGUgIT0gbnVsbCkgJiYgKG1pbmRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gdGhpcy5feWVhcikgJiYgKG1pbmRhdGUuZ2V0TW9udGgoKSA+PSB0aGlzLl9tb250aCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5fbW9udGggPSBNYXRoLm1heChtaW5kYXRlLmdldE1vbnRoKCksIHRoaXMuX21vbnRoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKChtYXhkYXRlICE9IG51bGwpICYmIChtYXhkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHRoaXMuX3llYXIpICYmIChtYXhkYXRlLmdldE1vbnRoKCkgPD0gdGhpcy5fbW9udGgpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX21vbnRoID0gTWF0aC5taW4obWF4ZGF0ZS5nZXRNb250aCgpLCB0aGlzLl9tb250aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0RnVsbFllYXIodGhpcy5feWVhciwgdGhpcy5fbW9udGgpO1xuICAgICAgICAgICAgaWYgKHNjb3BlLmRhdGUuZ2V0TW9udGgoKSAhPT0gdGhpcy5fbW9udGgpIHsgc2NvcGUuZGF0ZS5zZXREYXRlKDApOyB9XG5cbiAgICAgICAgICAgIGlmICgobWluZGF0ZSAhPSBudWxsKSAmJiAoc2NvcGUuZGF0ZSA8IG1pbmRhdGUpKSB7XG4gICAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0RGF0ZShtaW5kYXRlLmdldFRpbWUoKSk7XG4gICAgICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLnNlbGVjdChtaW5kYXRlLmdldERhdGUoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgobWF4ZGF0ZSAhPSBudWxsKSAmJiAoc2NvcGUuZGF0ZSA+IG1heGRhdGUpKSB7XG4gICAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0RGF0ZShtYXhkYXRlLmdldFRpbWUoKSk7XG4gICAgICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLnNlbGVjdChtYXhkYXRlLmdldERhdGUoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzYXZlKSB7IHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpOyB9XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIF9pbmNNb250aChtb250aHMpIHtcbiAgICAgICAgICAgIHRoaXMuX21vbnRoICs9IG1vbnRocztcbiAgICAgICAgICAgIHdoaWxlICgodGhpcy5fbW9udGggPCAwKSB8fCAodGhpcy5fbW9udGggPiAxMSkpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuX21vbnRoIDwgMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX21vbnRoICs9IDEyO1xuICAgICAgICAgICAgICAgIHRoaXMuX3llYXItLTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tb250aCAtPSAxMjtcbiAgICAgICAgICAgICAgICB0aGlzLl95ZWFyKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW9udGhDaGFuZ2UoKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgeWVhckNoYW5nZShzYXZlKSB7XG4gICAgICAgICAgICBpZiAoc2F2ZSA9PSBudWxsKSB7IHNhdmUgPSB0cnVlOyB9XG5cbiAgICAgICAgICAgIGlmICgoc2NvcGUuY2FsZW5kYXIuX3llYXIgPT0gbnVsbCkgfHwgKHNjb3BlLmNhbGVuZGFyLl95ZWFyID09PSAnJykpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICAgIGNvbnN0IHsgbWluZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xuICAgICAgICAgICAgY29uc3QgeyBtYXhkYXRlIH0gPSBzY29wZS5yZXN0cmljdGlvbnM7XG4gICAgICAgICAgICBpID0gKG1pbmRhdGUgIT0gbnVsbCkgJiYgKG1pbmRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gc2NvcGUuY2FsZW5kYXIuX3llYXIpID8gbWluZGF0ZS5nZXRNb250aCgpIDogMDtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IChtYXhkYXRlICE9IG51bGwpICYmIChtYXhkYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNjb3BlLmNhbGVuZGFyLl95ZWFyKSA/IG1heGRhdGUuZ2V0TW9udGgoKSA6IDExO1xuICAgICAgICAgICAgc2NvcGUuY2FsZW5kYXIuX21vbnRocyA9IHNjb3BlLmNhbGVuZGFyLl9hbGxNb250aHMuc2xpY2UoaSwgbGVuICsgMSk7XG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuY2FsZW5kYXIubW9udGhDaGFuZ2Uoc2F2ZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgc2NvcGUuY2xvY2sgPSB7XG4gICAgICAgICAgX21pbnV0ZXM6ICcwMCcsXG4gICAgICAgICAgX2hvdXJzOiAwLFxuICAgICAgICAgIF9pbmNIb3VycyhpbmMpIHtcbiAgICAgICAgICAgIHRoaXMuX2hvdXJzID0gc2NvcGUuX2hvdXJzMjRcbiAgICAgICAgICA/IE1hdGgubWF4KDAsIE1hdGgubWluKDIzLCB0aGlzLl9ob3VycyArIGluYykpXG4gICAgICAgICAgOiBNYXRoLm1heCgxLCBNYXRoLm1pbigxMiwgdGhpcy5faG91cnMgKyBpbmMpKTtcbiAgICAgICAgICAgIGlmIChpc05hTih0aGlzLl9ob3VycykpIHsgcmV0dXJuIHRoaXMuX2hvdXJzID0gMDsgfVxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBfaW5jTWludXRlcyhpbmMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9taW51dGVzID0gc2NvcGUuYWRkWmVybyhNYXRoLm1heCgwLCBNYXRoLm1pbig1OSwgcGFyc2VJbnQodGhpcy5fbWludXRlcykgKyBpbmMpKSkudG9TdHJpbmcoKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgc2V0QU0oYikge1xuICAgICAgICAgICAgaWYgKGIgPT0gbnVsbCkgeyBiID0gIXRoaXMuaXNBTSgpOyB9XG5cbiAgICAgICAgICAgIGlmIChiICYmICF0aGlzLmlzQU0oKSkge1xuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldEhvdXJzKHNjb3BlLmRhdGUuZ2V0SG91cnMoKSAtIDEyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWIgJiYgdGhpcy5pc0FNKCkpIHtcbiAgICAgICAgICAgICAgc2NvcGUuZGF0ZS5zZXRIb3VycyhzY29wZS5kYXRlLmdldEhvdXJzKCkgKyAxMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBpc0FNKCkgeyByZXR1cm4gc2NvcGUuZGF0ZS5nZXRIb3VycygpIDwgMTI7IH0sXG4gICAgICAgIH07XG4gICAgICAgIHNjb3BlLiR3YXRjaCgnY2xvY2suX21pbnV0ZXMnLCAodmFsLCBvbGRWYWwpID0+IHtcbiAgICAgICAgICBpZiAoIXZhbCkgeyByZXR1cm47IH1cblxuICAgICAgICAgIGNvbnN0IGludE1pbiA9IHBhcnNlSW50KHZhbCk7XG4gICAgICAgICAgaWYgKCFpc05hTihpbnRNaW4pICYmIGludE1pbiA+PSAwICYmIGludE1pbiA8PSA1OSAmJiAoaW50TWluICE9PSBzY29wZS5kYXRlLmdldE1pbnV0ZXMoKSkpIHtcbiAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0TWludXRlcyhpbnRNaW4pO1xuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLnNhdmVVcGRhdGVEYXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgc2NvcGUuJHdhdGNoKCdjbG9jay5faG91cnMnLCB2YWwgPT4ge1xuICAgICAgICAgIGlmICgodmFsICE9IG51bGwpICYmICFpc05hTih2YWwpKSB7XG4gICAgICAgICAgICBpZiAoIXNjb3BlLl9ob3VyczI0KSB7XG4gICAgICAgICAgICAgIGlmICh2YWwgPT09IDI0KSB7XG4gICAgICAgICAgICAgICAgdmFsID0gMTI7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsID09PSAxMikge1xuICAgICAgICAgICAgICAgIHZhbCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXNjb3BlLmNsb2NrLmlzQU0oKSkgeyB2YWwgKz0gMTI7IH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHZhbCAhPT0gc2NvcGUuZGF0ZS5nZXRIb3VycygpKSB7XG4gICAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0SG91cnModmFsKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLnNhdmVVcGRhdGVEYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBzY29wZS5zZXROb3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2NvcGUuc2V0RGF0ZSgpO1xuICAgICAgICAgIHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLm1vZGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoc2NvcGUuX2Rpc3BsYXlNb2RlICE9IG51bGwpIHsgc2NvcGUuX21vZGUgPSBzY29wZS5fZGlzcGxheU1vZGU7IH1cblxuICAgICAgICAgIHJldHVybiBgJHtzY29wZS5fdmVydGljYWxNb2RlID8gJ3ZlcnRpY2FsICcgOiAnJ30ke1xuICAgICAgICBzY29wZS5fZGlzcGxheU1vZGUgPT09ICdmdWxsJyA/ICdmdWxsLW1vZGUnXG4gICAgICAgIDogc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAndGltZScgPyAndGltZS1vbmx5J1xuICAgICAgICA6IHNjb3BlLl9kaXNwbGF5TW9kZSA9PT0gJ2RhdGUnID8gJ2RhdGUtb25seSdcbiAgICAgICAgOiBzY29wZS5fbW9kZSA9PT0gJ2RhdGUnID8gJ2RhdGUtbW9kZSdcbiAgICAgICAgOiAndGltZS1tb2RlJ30gJHtzY29wZS5fY29tcGFjdCA/ICdjb21wYWN0JyA6ICcnfWA7XG4gICAgICAgIH07XG5cbiAgICAgICAgc2NvcGUubW9kZVN3aXRjaCA9ICgpID0+IHNjb3BlLl9tb2RlID0gc2NvcGUuX2Rpc3BsYXlNb2RlICE9IG51bGwgPyBzY29wZS5fZGlzcGxheU1vZGUgOiBzY29wZS5fbW9kZSA9PT0gJ2RhdGUnID8gJ3RpbWUnIDogJ2RhdGUnO1xuICAgICAgICByZXR1cm4gc2NvcGUubW9kZVN3aXRjaFRleHQgPSAoKSA9PiBgJHtzY0RhdGVUaW1lSTE4bi5zd2l0Y2hUb30gJHtcbiAgICAgICAgc2NvcGUuX21vZGUgPT09ICdkYXRlJyA/IHNjRGF0ZVRpbWVJMThuLmNsb2NrIDogc2NEYXRlVGltZUkxOG4uY2FsZW5kYXJ9YDtcbiAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG4gIH0sXG5dKTtcbiJdfQ==
'use strict';

angular.module('scDateTime').run(['$templateCache', function($templateCache) {

  $templateCache.put('scDateTime-bootstrap.tpl', '<div ng-class="modeClass()" class="time-date"><div ng-click="modeSwitch()" class="display"><div class="title">{{display.title()}}</div><div class="content"><div class="super-title">{{display.super()}}</div><div ng-bind-html="display.main()" class="main-title"></div><div class="sub-title">{{display.sub()}}</div></div></div><div class="control"><div class="full-title">{{display.fullTitle()}}</div><div class="slider"><div class="date-control"><div class="title"><button type="button" ng-click="calendar._incMonth(-1)" style="float: left" ng-class="{\'visuallyhidden\': calendar.isPrevMonthButtonHidden()}" class="btn btn-link"><i class="fa fa-caret-left"></i></button><span class="month-part">{{date | date:\'MMMM\'}}<select ng-model="calendar._month" ng-change="calendar.monthChange()" ng-options="calendar._allMonths.indexOf(month) as month for month in calendar._months"></select></span> <input ng-model="calendar._year" ng-change="calendar.yearChange()" type="number" min="{{restrictions.mindate ? restrictions.mindate.getFullYear() : 0}}" max="{{restrictions.maxdate ? restrictions.maxdate.getFullYear() : NaN}}" class="year-part"> <button type="button" ng-click="calendar._incMonth(1)" style="float: right" ng-class="{\'visuallyhidden\': calendar.isNextMonthButtonHidden()}" class="btn btn-link"><i class="fa fa-caret-right"></i></button></div><div class="headers"><div ng-repeat="day in _weekdays track by $index" class="day-cell">{{day}}</div></div><div class="days"><button type="button" ng-style="{\'margin-left\': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-disabled="calendar.isDisabled(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1)" class="btn btn-link day-cell">1</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-disabled="calendar.isDisabled(2)" ng-click="calendar.select(2)" class="btn btn-link day-cell">2</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-disabled="calendar.isDisabled(3)" ng-click="calendar.select(3)" class="btn btn-link day-cell">3</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-disabled="calendar.isDisabled(4)" ng-click="calendar.select(4)" class="btn btn-link day-cell">4</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-disabled="calendar.isDisabled(5)" ng-click="calendar.select(5)" class="btn btn-link day-cell">5</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-disabled="calendar.isDisabled(6)" ng-click="calendar.select(6)" class="btn btn-link day-cell">6</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-disabled="calendar.isDisabled(7)" ng-click="calendar.select(7)" class="btn btn-link day-cell">7</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-disabled="calendar.isDisabled(8)" ng-click="calendar.select(8)" class="btn btn-link day-cell">8</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-disabled="calendar.isDisabled(9)" ng-click="calendar.select(9)" class="btn btn-link day-cell">9</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-disabled="calendar.isDisabled(10)" ng-click="calendar.select(10)" class="btn btn-link day-cell">10</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-disabled="calendar.isDisabled(11)" ng-click="calendar.select(11)" class="btn btn-link day-cell">11</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-disabled="calendar.isDisabled(12)" ng-click="calendar.select(12)" class="btn btn-link day-cell">12</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-disabled="calendar.isDisabled(13)" ng-click="calendar.select(13)" class="btn btn-link day-cell">13</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-disabled="calendar.isDisabled(14)" ng-click="calendar.select(14)" class="btn btn-link day-cell">14</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-disabled="calendar.isDisabled(15)" ng-click="calendar.select(15)" class="btn btn-link day-cell">15</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-disabled="calendar.isDisabled(16)" ng-click="calendar.select(16)" class="btn btn-link day-cell">16</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-disabled="calendar.isDisabled(17)" ng-click="calendar.select(17)" class="btn btn-link day-cell">17</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-disabled="calendar.isDisabled(18)" ng-click="calendar.select(18)" class="btn btn-link day-cell">18</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-disabled="calendar.isDisabled(19)" ng-click="calendar.select(19)" class="btn btn-link day-cell">19</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-disabled="calendar.isDisabled(20)" ng-click="calendar.select(20)" class="btn btn-link day-cell">20</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-disabled="calendar.isDisabled(21)" ng-click="calendar.select(21)" class="btn btn-link day-cell">21</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-disabled="calendar.isDisabled(22)" ng-click="calendar.select(22)" class="btn btn-link day-cell">22</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-disabled="calendar.isDisabled(23)" ng-click="calendar.select(23)" class="btn btn-link day-cell">23</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-disabled="calendar.isDisabled(24)" ng-click="calendar.select(24)" class="btn btn-link day-cell">24</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-disabled="calendar.isDisabled(25)" ng-click="calendar.select(25)" class="btn btn-link day-cell">25</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-disabled="calendar.isDisabled(26)" ng-click="calendar.select(26)" class="btn btn-link day-cell">26</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-disabled="calendar.isDisabled(27)" ng-click="calendar.select(27)" class="btn btn-link day-cell">27</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-disabled="calendar.isDisabled(28)" ng-click="calendar.select(28)" class="btn btn-link day-cell">28</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-disabled="calendar.isDisabled(29)" ng-click="calendar.select(29)" class="btn btn-link day-cell">29</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-disabled="calendar.isDisabled(30)" ng-click="calendar.select(30)" class="btn btn-link day-cell">30</button><span class="event-indicator"></span> <button type="button" ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-disabled="calendar.isDisabled(31)" ng-click="calendar.select(31)" class="btn btn-link day-cell">31</button><span class="event-indicator"></span></div></div><button type="button" ng-click="modeSwitch()" class="btn btn-link switch-control"><i class="fa fa-clock-o"></i><i class="fa fa-calendar"></i><span class="visuallyhidden">{{modeSwitchText()}}</span></button><div class="time-control"><div class="time-inputs"><input type="number" min="{{_hours24 ? 0 : 1}}" max="{{_hours24 ? 23 : 12}}" ng-model="clock._hours"> <button type="button" ng-click="clock._incHours(1)" class="btn btn-link hours up"><i class="fa fa-caret-up"></i></button> <button type="button" ng-click="clock._incHours(-1)" class="btn btn-link hours down"><i class="fa fa-caret-down"></i></button> <input type="text" ng-model="clock._minutes"> <button type="button" ng-click="clock._incMinutes(1)" class="btn btn-link minutes up"><i class="fa fa-caret-up"></i></button> <button type="button" ng-click="clock._incMinutes(-1)" class="btn btn-link minutes down"><i class="fa fa-caret-down"></i></button></div><div ng-if="!_hours24" class="buttons"><button type="button" ng-click="clock.setAM()" class="btn btn-link">{{date | date:\'a\'}}</button></div></div></div></div><div class="buttons"><button type="button" ng-click="setNow()" class="btn btn-link">{{:: translations.now}}</button> <button type="button" ng-click="cancel()" ng-if="!autosave" class="btn btn-link">{{:: translations.cancel}}</button> <button type="button" ng-click="save()" ng-if="!autosave" class="btn btn-link">{{:: translations.save}}</button></div></div>');

}]);
'use strict';

angular.module('scDateTime').run(['$templateCache', function($templateCache) {

  $templateCache.put('scDateTime-material.tpl', '<div ng-class="modeClass()" class="time-date"><div ng-click="modeSwitch()" aria-label="{{modeSwitchText()}}" class="display"><div class="title">{{display.title()}}</div><div class="content"><div class="super-title">{{display.super()}}</div><div ng-bind-html="display.main()" class="main-title"></div><div class="sub-title">{{display.sub()}}</div></div></div><div class="control"><div class="full-title">{{display.fullTitle()}}</div><div class="slider"><div class="date-control"><div class="title"><md-button type="button" ng-click="calendar._incMonth(-1)" aria-label="{{:: translations.previousMonth}}" style="float: left" ng-class="{\'visuallyhidden\': calendar.isPrevMonthButtonHidden()}"><i class="fa fa-caret-left"></i></md-button><span class="month-part">{{date | date:\'MMMM\'}}<select ng-model="calendar._month" ng-change="calendar.monthChange()" ng-options="calendar._allMonths.indexOf(month) as month for month in calendar._months"></select></span> <input ng-model="calendar._year" ng-change="calendar.yearChange()" type="number" min="{{restrictions.mindate ? restrictions.mindate.getFullYear() : 0}}" max="{{restrictions.maxdate ? restrictions.maxdate.getFullYear() : NaN}}" class="year-part"><md-button type="button" ng-click="calendar._incMonth(1)" aria-label="{{:: translations.nextMonth}}" style="float: right" ng-class="{\'visuallyhidden\': calendar.isNextMonthButtonHidden()}"><i class="fa fa-caret-right"></i></md-button></div><div class="headers"><div ng-repeat="day in _weekdays track by $index" class="day-cell">{{day}}</div></div><div class="days"><md-button type="button" ng-style="{\'margin-left\': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-disabled="calendar.isDisabled(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1)" aria-label="1" class="day-cell">1<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-disabled="calendar.isDisabled(2)" ng-click="calendar.select(2)" aria-label="2" class="day-cell">2<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-disabled="calendar.isDisabled(3)" ng-click="calendar.select(3)" aria-label="3" class="day-cell">3<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-disabled="calendar.isDisabled(4)" ng-click="calendar.select(4)" aria-label="4" class="day-cell">4<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-disabled="calendar.isDisabled(5)" ng-click="calendar.select(5)" aria-label="5" class="day-cell">5<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-disabled="calendar.isDisabled(6)" ng-click="calendar.select(6)" aria-label="6" class="day-cell">6<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-disabled="calendar.isDisabled(7)" ng-click="calendar.select(7)" aria-label="7" class="day-cell">7<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-disabled="calendar.isDisabled(8)" ng-click="calendar.select(8)" aria-label="8" class="day-cell">8<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-disabled="calendar.isDisabled(9)" ng-click="calendar.select(9)" aria-label="9" class="day-cell">9<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-disabled="calendar.isDisabled(10)" ng-click="calendar.select(10)" aria-label="10" class="day-cell">10<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-disabled="calendar.isDisabled(11)" ng-click="calendar.select(11)" aria-label="11" class="day-cell">11<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-disabled="calendar.isDisabled(12)" ng-click="calendar.select(12)" aria-label="12" class="day-cell">12<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-disabled="calendar.isDisabled(13)" ng-click="calendar.select(13)" aria-label="13" class="day-cell">13<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-disabled="calendar.isDisabled(14)" ng-click="calendar.select(14)" aria-label="14" class="day-cell">14<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-disabled="calendar.isDisabled(15)" ng-click="calendar.select(15)" aria-label="15" class="day-cell">15<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-disabled="calendar.isDisabled(16)" ng-click="calendar.select(16)" aria-label="16" class="day-cell">16<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-disabled="calendar.isDisabled(17)" ng-click="calendar.select(17)" aria-label="17" class="day-cell">17<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-disabled="calendar.isDisabled(18)" ng-click="calendar.select(18)" aria-label="18" class="day-cell">18<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-disabled="calendar.isDisabled(19)" ng-click="calendar.select(19)" aria-label="19" class="day-cell">19<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-disabled="calendar.isDisabled(20)" ng-click="calendar.select(20)" aria-label="20" class="day-cell">20<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-disabled="calendar.isDisabled(21)" ng-click="calendar.select(21)" aria-label="21" class="day-cell">21<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-disabled="calendar.isDisabled(22)" ng-click="calendar.select(22)" aria-label="22" class="day-cell">22<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-disabled="calendar.isDisabled(23)" ng-click="calendar.select(23)" aria-label="23" class="day-cell">23<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-disabled="calendar.isDisabled(24)" ng-click="calendar.select(24)" aria-label="24" class="day-cell">24<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-disabled="calendar.isDisabled(25)" ng-click="calendar.select(25)" aria-label="25" class="day-cell">25<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-disabled="calendar.isDisabled(26)" ng-click="calendar.select(26)" aria-label="26" class="day-cell">26<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-disabled="calendar.isDisabled(27)" ng-click="calendar.select(27)" aria-label="27" class="day-cell">27<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-disabled="calendar.isDisabled(28)" ng-click="calendar.select(28)" aria-label="28" class="day-cell">28<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-disabled="calendar.isDisabled(29)" ng-click="calendar.select(29)" aria-label="29" class="day-cell">29<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-disabled="calendar.isDisabled(30)" ng-click="calendar.select(30)" aria-label="30" class="day-cell">30<span class="event-indicator"></span></md-button><md-button type="button" ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-disabled="calendar.isDisabled(31)" ng-click="calendar.select(31)" aria-label="31" class="day-cell">31<span class="event-indicator"></span></md-button></div></div><md-button type="button" ng-click="modeSwitch()" aria-label="{{modeSwitchText()}}" class="switch-control"><i class="fa fa-clock-o"></i><i class="fa fa-calendar"></i><span class="visuallyhidden">{{modeSwitchText()}}</span></md-button><div class="time-control"><div class="time-inputs"><input type="number" min="{{_hours24 ? 0 : 1}}" max="{{_hours24 ? 23 : 12}}" ng-model="clock._hours"><md-button type="button" ng-click="clock._incHours(1)" aria-label="{{:: translations.incrementHours}}" class="hours up"><i class="fa fa-caret-up"></i></md-button><md-button type="button" ng-click="clock._incHours(-1)" aria-label="{{:: translations.decrementHours}}" class="hours down"><i class="fa fa-caret-down"></i></md-button><input type="text" ng-model="clock._minutes"><md-button type="button" ng-click="clock._incMinutes(1)" aria-label="{{:: translations.incrementMinutes}}" class="minutes up"><i class="fa fa-caret-up"></i></md-button><md-button type="button" ng-click="clock._incMinutes(-1)" aria-label="{{:: translations.decrementMinutes}}" class="minutes down"><i class="fa fa-caret-down"></i></md-button></div><div ng-if="!_hours24" class="buttons"><md-button type="button" ng-click="clock.setAM()" aria-label="{{:: translations.switchAmPm}}">{{date | date:\'a\'}}</md-button></div></div></div></div><div class="buttons"><md-button type="button" ng-click="setNow()" aria-label="{{:: translations.now}}">{{:: translations.now}}</md-button><md-button type="button" ng-click="cancel()" ng-if="!autosave" aria-label="{{:: translations.cancel}}">{{:: translations.cancel}}</md-button><md-button type="button" ng-click="save()" ng-if="!autosave" aria-label="{{:: translations.save}}">{{:: translations.save}}</md-button></div></div>');

}]);