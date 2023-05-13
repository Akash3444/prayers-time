import axios from 'axios';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import 'date-fns/locale/ar';
import moment from 'moment/moment';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';
import Spinner from './components/ui/Spinner/Spinner';
import momentHijri from 'moment-hijri';
import Hero from './components/Hero';
import { hijryMonths, weekdays } from './utils/constants';

const axiosInstance = axios.create({
  auth: {
    username: process.env.REACT_APP_API_USERNAME,
    password: process.env.REACT_APP_API_PASSWORD,
  },
});
const getEmirates = async () => {
  return await axiosInstance.get('GetEmiratesList');
};

const getAreas = async ({ queryKey }) => {
  const [_, id] = queryKey;

  return await axiosInstance.get(`GetAreasByEmirateID/${id}`);
};

const getAllAreas = async () => await axiosInstance.get('GetAllAreas');
const getTodayPrayerTimeByAreaID = async ({ queryKey }) => {
  console.log('queryKey :', queryKey);
  const [_, areaId] = queryKey;

  return await axiosInstance.get(`GetTodayPrayerTimeByAreaID/${areaId}`);
};
const getTodayPrayerTimeByDate = async ({ queryKey }) => {
  const [_, { areaId, date }] = queryKey;

  return await axiosInstance.get(`GetPrayerTimeByDate/${areaId}/${date}`);
};
const getYearlyPrayerTimes = async ({ queryKey }) => {
  const [_, year] = queryKey;

  return await axiosInstance.get(`GetYearlyPrayerTimes/${year}`);
};

const prayerTime = {
  pid: 69245,
  gDate: '2022-07-06T00:00:00',
  dayofWeek: 'Wednesday',
  hijryDay: 7,
  hijryMonth: 12,
  hijryYear: 1443,
  emsak: '2022-07-19T04:19:00',
  fajr: '2022-07-19T04:19:00',
  shurooq: '2022-07-19T05:42:00',
  zuhr: '2022-07-19T12:32:00',
  asr: '2022-07-19T15:47:00',
  maghrib: '2022-07-19T19:18:00',
  isha: '2022-07-19T20:40:00',
  emirateID: 1,
  areaID: 11,
  emirateNameAr: 'أبوظبي',
  emirateNameEn: 'Abu Dhabi',
  areaNameAr: 'ليوا',
  areaNameEn: 'Liwa',
};

function App() {
  const [values, setValues] = useState({
    filterBy: 'area',
    month: '',
    year: '',
    emirate: '',
    area: '',
  });
  const [prayerData, setPrayerData] = useState();
  const [years, setYears] = useState([]);
  const [date, setDate] = useState(null);
  const {
    isLoading: isLoadingEmirates,
    isFetching: isFetchingEmirates,
    data,
  } = useQuery('emirates', getEmirates, {
    enabled: values.filterBy === 'area' || values.filterBy === 'dateMonth',
  });
  const {
    isLoading: isLoadingAllAreas,
    isFetching: isFetchingAllAreas,
    data: allAreas,
  } = useQuery('areas', getAllAreas, {
    enabled: values.filterBy === 'area' || values.filterBy === 'dateMonth',
  });
  const {
    isLoading: isLoadingAreas,
    isFetching: isFetchingAreas,
    data: areas,
  } = useQuery(['areas', values.emirate], getAreas, {
    enabled: !!values.emirate && (values.filterBy === 'area' || values.filterBy === 'dateMonth'),
  });
  const {
    refetch: fetchTodayPrayerTimeByDate,
    isLoading: isLoadingPrayerTimesByDate,
    isRefetching: isRefetchingPrayerTimesByDate,
  } = useQuery(
    ['todayPrayerTimeByDate', { areaId: values.area, date: moment(date).format('YYYY-DD-MM') }],
    getTodayPrayerTimeByDate,
    {
      enabled: false,
      onError: (error) => {
        toast.error('Something went wrong!');
      },
    }
  );
  const {
    refetch: fetchTodayPrayerTimeByAreaID,
    isLoading: isLoadingPrayerTimesByAreaID,
    isRefetching: isRefetchingPrayerTimesByAreaID,
    data: todayPrayerTImeByAreaID,
  } = useQuery(['todayPrayerTimeByAreaID', values.area], getTodayPrayerTimeByAreaID, {
    enabled: false,
  });
  const {
    refetch: fetchYearlyPrayerTimes,
    isLoading: isLoadingYearlyPrayerTimes,
    isRefetching: isRefetchingYearlyPrayerTimes,
    data: yearlyPrayerTimes,
  } = useQuery(['yearlyPrayerTimes', values.year], getYearlyPrayerTimes, {
    enabled: false,
  });

  const isLoadingPrayerData =
    isLoadingPrayerTimesByAreaID ||
    isLoadingPrayerTimesByDate ||
    isLoadingYearlyPrayerTimes ||
    isRefetchingPrayerTimesByAreaID ||
    isRefetchingPrayerTimesByDate ||
    isRefetchingYearlyPrayerTimes;

  const handleChange = ({ target: { name, value } }) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSearch = async () => {
    if (values.area && date) {
      const res = await fetchTodayPrayerTimeByDate();
      setPrayerData(res.data?.data?.result);
    } else if (values.area) {
      const res = await fetchTodayPrayerTimeByAreaID();
      setPrayerData(res.data?.data?.result);
    }
  };

  const handleSearchByHijriYear = async () => {
    if (values.year) {
      const res = await fetchYearlyPrayerTimes();
      setPrayerData(res.data?.data?.result);
    }
  };

  const fetchMoreData = () => {};

  useEffect(() => {
    function checkScroll(e) {
      const documentHeight = document.body.scrollHeight;
      const currentScroll = window.scrollY + window.innerHeight;

      if (currentScroll > documentHeight) {
        fetchMoreData();
      }
    }
    document.addEventListener('scroll', checkScroll);

    return () => document.removeEventListener('scroll', checkScroll);
  }, []);

  return (
    <div>
      <Hero />

      {/* Filters */}
      <main className="my-12 max-w-screen-xl mx-auto px-6">
        <div
          id="start"
          className="relative z-10 max-w-screen-xl flex flex-wrap items-end justify-end lg:justify-center bg-slate-200 rounded-md p-3 sm:p-6 mx-auto gap-12 mb-12"
        >
          <div className="w-full sm:w-auto">
            <p className="text-lg font-semibold mb-3 text-end">تصفية حسب الإمارة والمنطقة</p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-end gap-5">
              <div className="flex flex-col gap-1 flex-1 sm:max-w-max">
                <label htmlFor="filterBy" className="flex flex-row-reverse items-center gap-2">
                  الإمارة
                  {(isLoadingEmirates || isFetchingEmirates) && (
                    <Spinner size="small" className="inline-block" />
                  )}
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

              <div className="flex flex-col gap-1 flex-1 sm:max-w-max">
                <label htmlFor="filterBy" className="flex flex-row-reverse items-center gap-2">
                  منطقة
                  {(isLoadingAllAreas ||
                    isLoadingAreas ||
                    isFetchingAllAreas ||
                    isFetchingAreas) && <Spinner size="small" className="inline-block" />}
                </label>

                <select
                  name="area"
                  id="area"
                  value={values.area}
                  onChange={handleChange}
                  className="rounded-md max-w-full sm:max-w-max w-full"
                >
                  <option value="">حدد المنطقة</option>
                  {(values.emirate ? areas : allAreas)?.data?.result?.map(
                    ({ cityID, cityName }) => (
                      <option key={cityID} value={cityID}>
                        {cityName}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <p className="text-lg font-semibold mb-3 text-end">تصفية حسب السنة والشهر والفترة</p>
            <div className="flex flex-col sm:flex-row w-full sm:max-w-max sm:items-end sm:ms-auto gap-5">
              {values.year && (
                <button
                  onClick={handleSearchByHijriYear}
                  className="order-last sm:order-first rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  البحث بالسنة الهجرية
                </button>
              )}
              <div className="w-full sm:max-w-max">
                <label className="mb-1 block text-end w-full">السنة والشهر والفترة</label>
                <ReactDatePicker
                  selected={date}
                  wrapperClassName="w-full sm:max-w-max"
                  onChange={(update) => {
                    const hijriYear = momentHijri(update).format('iYYYY');

                    setYears(() => [hijriYear]);
                    setValues((prevValues) => ({
                      ...prevValues,
                      year: hijriYear,
                    }));
                    setDate(update);
                  }}
                  isClearable
                  className="w-full rounded-md"
                />
              </div>
              {values.year && (
                <div className="flex flex-col gap-1 sm:max-w-max">
                  <label htmlFor="filterBy" className="text-end">
                    السنة الهجرية
                  </label>
                  <select
                    name="year"
                    id="year"
                    value={values.year}
                    onChange={handleChange}
                    className="rounded-md"
                    disabled
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
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={handleSearch}
              className="block w-full sm:inline rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              يبحث
            </button>
          </div>
        </div>

        <div className="max-w-full w-full overflow-x-auto">
          <table className="w-full border" style={{ direction: 'rtl' }}>
            <thead className="border-b bg-gray-300 border">
              <tr>
                <th className="border p-3 whitespace-nowrap font-semibold text-center">يوم</th>
                <th className="border p-3 whitespace-nowrap font-semibold text-center">تاريخ</th>
                <th className="border p-3 whitespace-nowrap font-semibold text-center">
                  التاريخ الإسلامي
                </th>
                <th className="border p-3 whitespace-nowrap font-semibold text-center">فقير</th>
                <th className="border p-3 whitespace-nowrap font-semibold text-center">شروق</th>
                <th className="border p-3 whitespace-nowrap font-semibold text-center">ظهر</th>
                <th className="border p-3 whitespace-nowrap font-semibold text-center">العصر</th>
                <th className="border p-3 whitespace-nowrap font-semibold text-center">المغرب</th>
                <th className="border p-3 whitespace-nowrap font-semibold text-center">العشاء</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingPrayerData && (
                <tr>
                  <td colSpan={9} className="py-3">
                    <Spinner className="mx-auto" />
                  </td>
                </tr>
              )}

              {!isLoadingPrayerData &&
                (prayerData ? (Array.isArray(prayerData) ? prayerData : [prayerData]) : []).map(
                  (prayerData, index) => (
                    <tr key={index} className="odd:bg-gray-100">
                      <td className="border-b border p-3 whitespace-nowrap text-center">
                        {weekdays[prayerData.dayofWeek.trim().toLowerCase()]}
                      </td>
                      <td className="border-b border p-3 whitespace-nowrap text-center">
                        {moment(prayerData.gDate).format('MM/DD/YYYY')}
                      </td>
                      <td className="border-b border p-3 whitespace-nowrap text-center">
                        <span>{prayerData.hijryYear}</span>
                        <span>{hijryMonths[prayerData.hijryMonth - 1].ar}</span>
                        <span>{prayerData.hijryDay}</span>
                      </td>
                      <td className="border-b border p-3 whitespace-nowrap text-center">
                        {moment(prayerData.fajr).locale('ar').format('LT')}
                      </td>
                      <td className="border-b border p-3 whitespace-nowrap text-center">
                        {moment(prayerData.shurooq).format('LT')}
                      </td>
                      <td className="border-b border p-3 whitespace-nowrap text-center">
                        {moment(prayerData.zuhr).format('LT')}
                      </td>
                      <td className="border-b border p-3 whitespace-nowrap text-center">
                        {moment(prayerData.asr).format('LT')}
                      </td>
                      <td className="border-b border p-3 whitespace-nowrap text-center">
                        {moment(prayerData.maghrib).format('LT')}
                      </td>
                      <td className="border-b border p-3 whitespace-nowrap text-center">
                        {moment(prayerData.isha).format('LT')}
                      </td>
                    </tr>
                  )
                )}

              {!isLoadingPrayerData &&
                (prayerData ? (Array.isArray(prayerData) ? prayerData : [prayerData]) : [])
                  .length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-3 text-center">
                      لا نتائج
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
