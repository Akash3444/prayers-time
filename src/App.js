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
import InfiniteScroll from 'react-infinite-scroll-component';

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
  const [prayerTimes, setPrayerTimes] = useState(new Array(5).fill(prayerTime));
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

  const fetchMoreData = () => {
    setPrayerTimes((prev) => [...prev, ...new Array(5).fill(prayerTime)]);
  };

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
      <main className="pt-20 max-w-screen-xl mx-auto px-6">
        <div
          id="start"
          className="relative z-10 max-w-screen-xl flex flex-wrap items-end justify-between mx-auto gap-6 mb-12"
        >
          <div>
            <p className="text-lg font-semibold mb-3 text-end">تصفية حسب الإمارة والمنطقة</p>
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 max-w-max">
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
                  className="rounded-md text-end"
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

              <div className="flex flex-col gap-1 max-w-max">
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
                  className="rounded-md text-end max-w-max w-full"
                >
                  <option value="1">حدد المنطقة</option>
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
          <div>
            <p className="text-lg font-semibold mb-3 text-end">تصفية حسب السنة والشهر والفترة</p>
            <div className="flex max-w-max items-start gap-3">
              <div className="max-w-max">
                <label className="mb-1 block text-end w-full">السنة والشهر والفترة</label>
                <ReactDatePicker
                  selected={date}
                  wrapperClassName="max-w-max"
                  onChange={(update) => {
                    const hijriYear = momentHijri(update).format('iYYYY');

                    setYears((prevYears) => [...prevYears, hijriYear]);
                    setValues((prevValues) => ({
                      ...prevValues,
                      year: hijriYear,
                    }));
                    setDate(update);
                  }}
                  isClearable
                  locale="ar"
                  className="max-w-max w-full rounded-md"
                />
              </div>
              <div className="flex flex-col gap-1 max-w-max block">
                <label htmlFor="filterBy" className="text-end">
                  السنة الهجرية
                </label>
                <select
                  name="year"
                  id="year"
                  value={values.year}
                  onChange={handleChange}
                  className="rounded-md text-end"
                >
                  <option value="">اختر السنة</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleSearch}
              className="me-3 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              // className="mt-6 py-2 px-4 bg-slate-400 text-white rounded-lg block"
            >
              يبحث
            </button>
            <button
              onClick={handleSearchByHijriYear}
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              // className="mt-6 py-2 px-4 bg-slate-400 text-white rounded-lg block"
            >
              البحث بالسنة الهجرية
            </button>
          </div>
        </div>

        <div className="max-w-full w-full overflow-x-auto">
          <InfiniteScroll
            dataLength={setPrayerTimes.length}
            next={fetchMoreData}
            style={{ display: 'flex', flexDirection: 'column-reverse' }} //To put endMessage and loader to the top.
            inverse={true} //
            hasMore={true}
            loader={<h4>Loading...</h4>}
            // scrollableTarget="scrollableDiv"
          >
            {' '}
            <table className="w-full">
              <thead className="border-b bg-gray-300">
                <tr>
                  <th className="py-3 px-3 whitespace-nowrap font-semibold text-end">يوم</th>
                  <th className="py-3 px-3 whitespace-nowrap font-semibold text-end">تاريخ</th>
                  <th className="py-3 px-3 whitespace-nowrap font-semibold text-end">
                    التاريخ الإسلامي
                  </th>
                  <th className="py-3 px-3 whitespace-nowrap font-semibold text-end">فقير</th>
                  <th className="py-3 px-3 whitespace-nowrap font-semibold text-end">شروق</th>
                  <th className="py-3 px-3 whitespace-nowrap font-semibold text-end">ظهر</th>
                  <th className="py-3 px-3 whitespace-nowrap font-semibold text-end">العصر</th>
                  <th className="py-3 px-3 whitespace-nowrap font-semibold text-end">المغرب</th>
                  <th className="py-3 px-3 whitespace-nowrap font-semibold text-end">العشاء</th>
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

                {prayerTimes.map((prayerData, index) => (
                  <tr key={index}>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {prayerData.dayofWeek}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.gDate).format('MM/DD/YYYY')}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {prayerData.hijryDay} {hijryMonths[prayerData.hijryMonth - 1].ar}{' '}
                      {prayerData.hijryYear}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.fajr).format('LT')}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.shurooq).format('LT')}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.zuhr).format('LT')}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.asr).format('LT')}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.maghrib).format('LT')}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.isha).format('LT')}
                    </td>
                  </tr>
                ))}

                {prayerData && (
                  <tr>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {prayerData.dayofWeek}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.gDate).format('MM/DD/YYYY')}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {prayerData.hijryDay} {hijryMonths[prayerData.hijryMonth - 1].ar}{' '}
                      {prayerData.hijryYear}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.fajr).format('LT')}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.shurooq).format('LT')}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.zuhr).format('LT')}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.asr).format('LT')}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.maghrib).format('LT')}
                    </td>
                    <td className="border-b py-3 px-3 whitespace-nowrap text-end">
                      {moment(prayerData.isha).format('LT')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      </main>
    </div>
  );
}

export default App;
