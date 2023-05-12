import axios from 'axios';
import { useState } from 'react';
import { useQuery } from 'react-query';
import 'date-fns/locale/ar';
import moment from 'moment/moment';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';
import Spinner from './components/ui/Spinner/Spinner';
import momentHijri from 'moment-hijri';
import Hero from './components/Hero';

const hijryMonths = [
  {
    ar: ' جمادى الاول',
    en: 'JamadAlAwal',
  },
  {
    ar: 'جمادى الثانى',
    en: 'JamadAlThani',
  },
  {
    ar: 'رجب',
    en: 'Rajab',
  },
  {
    ar: 'شعبان',
    en: 'Shaban',
  },
  {
    ar: 'رمضان',
    en: 'Ramadhan',
  },
  {
    ar: 'شوال',
    en: 'Shawal',
  },
  {
    ar: 'ذى القعدة',
    en: 'ZelQad',
  },
  {
    ar: 'ذى الحجة',
    en: 'ZelHaj',
  },
  {
    ar: 'محرم',
    en: 'Moharram',
  },
  {
    ar: 'صفر',
    en: 'Safar',
  },
  {
    ar: 'ربيع الاول',
    en: 'RabiAlAwal',
  },
  {
    ar: 'ربيع الثانى',
    en: 'RabiAlThani',
  },
];

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

function App() {
  const [values, setValues] = useState({
    filterBy: 'area',
    month: '',
    year: '',
    emirate: '',
    area: '',
  });
  const [prayerData, setPrayerData] = useState();
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
    } else if (values.filterBy === 'year') {
      const res = await fetchYearlyPrayerTimes();
      setPrayerData(res.data?.data?.result);
    }
  };

  return (
    <div>
      <Hero />

      {/* Filters */}
      <div
        id="start"
        className="relative z-10 max-w-screen-xl flex flex-wrap items-end justify-between mx-auto gap-6 mb-12 px-6"
      >
        <div>
          <p className="text-lg font-semibold mb-3">Filter by emirate and area</p>
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-1 max-w-max">
              <label htmlFor="filterBy" className="flex items-center gap-2">
                Emirate{' '}
                {(isLoadingEmirates || isFetchingEmirates) && (
                  <Spinner size="small" className="inline-block" />
                )}
              </label>
              <select
                name="emirate"
                id="emirate"
                value={values.emirate}
                onChange={handleChange}
                className="rounded-md text-end"
              >
                <option value="">Select emirate</option>
                {!isLoadingEmirates &&
                  data?.data?.result?.map(({ emiratesId, emirateName }) => (
                    <option key={emiratesId} value={emiratesId}>
                      {emirateName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 max-w-max">
              <label htmlFor="filterBy" className="flex items-center gap-2">
                Area{' '}
                {(isLoadingAllAreas || isLoadingAreas || isFetchingAllAreas || isFetchingAreas) && (
                  <Spinner size="small" className="inline-block" />
                )}
              </label>

              <select
                name="area"
                id="area"
                value={values.area}
                onChange={handleChange}
                className="rounded-md text-end max-w-max w-full"
              >
                <option value="1">Select area</option>
                {(values.emirate ? areas : allAreas)?.data?.result?.map(({ cityID, cityName }) => (
                  <option key={cityID} value={cityID}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold mb-3">Filter by year, month and period</p>
          <div className="flex max-w-max items-start gap-3">
            <div className="flex flex-col gap-1 max-w-max block">
              <label htmlFor="filterBy">Hijri Year</label>
              <select
                name="year"
                id="year"
                value={values.year}
                onChange={handleChange}
                className="rounded-md text-end"
              >
                <option value="">Select year</option>
                {[1444].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="max-w-max">
              <label className="inline-block mb-1">Date and period</label>
              <ReactDatePicker
                selected={date}
                wrapperClassName="max-w-max"
                // startDate={new Date(`${values.year}-01-01`)}
                // endDate={new Date(`${values.year}-12-31`)}
                onChange={(update) => {
                  setDate(update);
                }}
                className="max-w-max w-full rounded-md"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          // className="mt-6 py-2 px-4 bg-slate-400 text-white rounded-lg block"
        >
          Search
        </button>
      </div>

      <main className="pb-20 max-w-screen-xl mx-auto px-6">
        <div className="max-w-full w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="py-2 px-3 whitespace-nowrap font-semibold">Day</th>
                <th className="py-2 px-3 whitespace-nowrap font-semibold">Date</th>
                <th className="py-2 px-3 whitespace-nowrap font-semibold">Islamic Date</th>
                <th className="py-2 px-3 whitespace-nowrap font-semibold">Fakjir</th>
                <th className="py-2 px-3 whitespace-nowrap font-semibold">Shurooq</th>
                <th className="py-2 px-3 whitespace-nowrap font-semibold">Zuhr</th>
                <th className="py-2 px-3 whitespace-nowrap font-semibold">Asr</th>
                <th className="py-2 px-3 whitespace-nowrap font-semibold">Maghrib</th>
                <th className="py-2 px-3 whitespace-nowrap font-semibold">Isha</th>
              </tr>
            </thead>
            <tbody>
              {(isLoadingPrayerTimesByAreaID ||
                isLoadingPrayerTimesByDate ||
                isLoadingYearlyPrayerTimes ||
                isRefetchingPrayerTimesByAreaID ||
                isRefetchingPrayerTimesByDate ||
                isRefetchingYearlyPrayerTimes) && (
                <tr>
                  <td colSpan={9} className="py-3">
                    <Spinner className="mx-auto" />
                  </td>
                </tr>
              )}
              {prayerData && (
                <tr>
                  <td className="py-2 px-3 whitespace-nowrap">{prayerData.dayofWeek}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {moment(prayerData.gDate).format('MM/DD/YYYY')}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {prayerData.hijryDay} {hijryMonths[prayerData.hijryMonth - 1].ar}{' '}
                    {prayerData.hijryYear}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {moment(prayerData.fajr).format('LT')}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {moment(prayerData.shurooq).format('LT')}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {moment(prayerData.zuhr).format('LT')}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {moment(prayerData.asr).format('LT')}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {moment(prayerData.maghrib).format('LT')}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {moment(prayerData.isha).format('LT')}
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
