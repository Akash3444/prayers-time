import React, { useState } from 'react';
import Spinner from './ui/Spinner/Spinner';
import momentHijri from 'moment-hijri';
import ReactDatePicker from 'react-datepicker';
import moment from 'moment/moment';
import { getYears } from '../utils/helpers';

const initialHijriYears = ['1441', '1442', '1443', '1444'];
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const Filters = ({
  isLoadingEmirates,
  isLoadingAllAreas,
  isLoadingAreas,
  values,
  handleChange,
  data,
  areas,
  allAreas,
  handleSearch,
  date,
  setDate,
  setValues,
  handleSearchByHijriYear,
}) => {
  const [years, setYears] = useState(initialHijriYears);
  const yearList = getYears();

  return (
    <div
      id="start"
      className="relative z-10 max-w-screen-xl flex flex-col xl:flex-row flex-wrap items-end justify-end lg:justify-center bg-slate-200 rounded-md p-3 sm:p-6 mx-auto gap-12 mb-12"
    >
      <div className="w-full xl:w-auto">
        <p className="text-lg font-semibold mb-3 text-end">تصفية حسب الإمارة والمنطقة</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-end gap-5">
          <div className="flex flex-col gap-1 flex-1 xl:max-w-max">
            <label htmlFor="filterBy" className="flex flex-row-reverse items-center gap-2">
              الإمارة
              {isLoadingEmirates && <Spinner size="small" className="inline-block" />}
            </label>
            <select
              name="emirate"
              id="emirate"
              value={values.emirate}
              onChange={handleChange}
              className="rounded-md"
            >
              <option value="">اختر الإمارة</option>
              {!isLoadingEmirates &&
                data?.data?.result?.map(({ emiratesId, emirateName }) => (
                  <option key={emiratesId} value={emiratesId}>
                    {emirateName}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1 xl:max-w-max">
            <label htmlFor="filterBy" className="flex flex-row-reverse items-center gap-2">
              منطقة
              {(isLoadingAllAreas || isLoadingAreas) && (
                <Spinner size="small" className="inline-block" />
              )}
            </label>

            <select
              name="area"
              id="area"
              value={values.area}
              onChange={handleChange}
              className="rounded-md max-w-full xl:max-w-max w-full"
            >
              <option value="">حدد المنطقة</option>
              {(values.emirate ? areas : allAreas)?.data?.result?.map(({ cityID, cityName }) => (
                <option key={cityID} value={cityID}>
                  {cityName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="w-full xl:w-auto">
        <p className="text-lg font-semibold mb-3 text-end">تصفية حسب السنة والشهر والفترة</p>
        <div className="flex flex-col sm:flex-row w-full xl:max-w-max sm:items-end xl:ms-auto gap-5">
          <div className="sm:order-last w-full xl:max-w-max">
            <label className="mb-1 block text-end w-full">السنة والشهر والفترة</label>
            <ReactDatePicker
              selected={date}
              wrapperClassName="w-full xl:max-w-max"
              onChange={(update) => {
                const hijriYear = momentHijri(update).format('iYYYY');

                setValues((prevValues) => ({
                  ...prevValues,
                  year: momentHijri(hijriYear).isValid() ? hijriYear : '',
                }));
                setYears(() => [
                  ...new Set(
                    momentHijri(hijriYear).isValid() ? [...initialHijriYears, hijriYear] : []
                  ),
                ]);
                setDate(update);
              }}
              isClearable
              className="w-full rounded-md"
              renderCustomHeader={({ date, changeYear, changeMonth }) => (
                <div className="w-full max-w-full flex items-center justify-center gap-2">
                  <select
                    value={months[moment(date).month()]}
                    onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                    className="rounded-md text-sm"
                  >
                    {months.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <select
                    value={moment(date).format('YYYY')}
                    onChange={({ target: { value } }) => changeYear(value)}
                    className="rounded-md text-sm"
                  >
                    {yearList.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />
          </div>

          {values.year && (
            <div className="flex flex-col gap-1 xl:max-w-max">
              <label htmlFor="filterBy" className="text-end">
                السنة الهجرية
              </label>

              <select
                name="year"
                id="year"
                value={values.year}
                onChange={handleChange}
                className="rounded-md"
                // disabled
              >
                <option value="">اختر السنة</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
          {values.year && (
            <button
              onClick={handleSearchByHijriYear}
              className="sm:order-first whitespace-nowrap rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              البحث بالسنة الهجرية
            </button>
          )}
        </div>
      </div>

      <div className="w-full xl:w-auto">
        <button
          onClick={handleSearch}
          className="block w-full sm:inline rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          يبحث
        </button>
      </div>
    </div>
  );
};

export default Filters;
