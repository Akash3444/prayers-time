import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import 'date-fns/locale/ar';
import moment from 'moment/moment';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';
import Hero from './components/Hero';
import Filters from './components/Filters';
import PrayerTimesTable from './components/PrayerTimesTable';
import TodayPrayerTimes from './components/TodayPrayerTimes';
import { axiosInstance } from './utils/helpers';

const getEmirates = async () => {
  return await axiosInstance.get('GetEmiratesList');
};

const getAreas = async ({ queryKey }) => {
  const [_, id] = queryKey;

  return await axiosInstance.get(`GetAreasByEmirateID/${id}`);
};

const getAllAreas = async () => await axiosInstance.get('GetAllAreas');
const getTodayPrayerTimeByAreaID = async ({ queryKey }) => {
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
  const [isLoadingMorePrayers, setIsLoadingMorePrayers] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [date, setDate] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const {
    isLoading: isLoadingEmirates,
    isFetching: isFetchingEmirates,
    data,
  } = useQuery('emirates', getEmirates, {
    enabled: values.filterBy === 'area' || values.filterBy === 'dateMonth',
    refetchOnWindowFocus: false,
  });
  const {
    isLoading: isLoadingAllAreas,
    isFetching: isFetchingAllAreas,
    data: allAreas,
  } = useQuery('areas', getAllAreas, {
    enabled: values.filterBy === 'area' || values.filterBy === 'dateMonth',
    refetchOnWindowFocus: false,
  });
  const {
    isLoading: isLoadingAreas,
    isFetching: isFetchingAreas,
    data: areas,
  } = useQuery(['areas', values.emirate], getAreas, {
    enabled: !!values.emirate && (values.filterBy === 'area' || values.filterBy === 'dateMonth'),
    refetchOnWindowFocus: false,
  });
  const {
    refetch: fetchTodayPrayerTimeByDate,
    isLoading: isLoadingPrayerTimesByDate,
    isRefetching: isRefetchingPrayerTimesByDate,
  } = useQuery(
    ['todayPrayerTimeByDate', { areaId: values.area, date: moment(date).format('YYYY-DD-MM') }],
    getTodayPrayerTimeByDate,
    {
      retry: false,
      enabled: false,
      onError: (error) => {
        Object.values(error.response.data.errors).forEach((error) => toast.error(error));
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
      setSelectedTab(-1);
      const res = await fetchTodayPrayerTimeByDate();
      setPrayerData(res.data?.data?.result);
    } else if (values.area) {
      setSelectedTab(-1);
      const res = await fetchTodayPrayerTimeByAreaID();
      setPrayerData(res.data?.data?.result);
    }
  };

  const handleSearchByHijriYear = async () => {
    if (values.year) {
      setSelectedTab(-1);
      const res = await fetchYearlyPrayerTimes();
      setPrayerData(res.data?.data?.result);
    }
  };

  const fetchMoreData = useCallback(() => {
    if (prayerData?.length >= pageSize + 5 && !isLoadingMorePrayers) {
      setIsLoadingMorePrayers(true);
      setTimeout(() => {
        setPageSize((prev) => prev + 5);
        setIsLoadingMorePrayers(false);
      }, 500);
    }
  }, [prayerData?.length, pageSize]);

  const timerRef = useRef();

  useEffect(() => {
    function checkScroll(e) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const documentHeight = document.body.scrollHeight;
        const currentScroll = window.scrollY + window.innerHeight;

        if (currentScroll > documentHeight) {
          fetchMoreData();
        }
      }, 200);
    }
    document.addEventListener('scroll', checkScroll);

    return () => document.removeEventListener('scroll', checkScroll);
  }, [fetchMoreData]);

  useEffect(() => {
    setPageSize(5);
  }, [prayerData]);

  return (
    <div>
      <Hero />

      <main className="my-12 max-w-screen-xl mx-auto px-6">
        {/* Filters */}
        <Filters
          allAreas={allAreas}
          areas={areas}
          data={data}
          date={date}
          handleChange={handleChange}
          handleSearch={handleSearch}
          handleSearchByHijriYear={handleSearchByHijriYear}
          isLoadingAllAreas={isLoadingAllAreas || isFetchingAllAreas}
          isLoadingAreas={isLoadingAreas || isFetchingAreas}
          isLoadingEmirates={isLoadingEmirates || isFetchingEmirates}
          setDate={setDate}
          setValues={setValues}
          values={values}
        />

        {!!values.area && <TodayPrayerTimes areaId={values.area} />}

        <PrayerTimesTable
          isLoadingMorePrayers={isLoadingMorePrayers}
          isLoadingPrayerData={isLoadingPrayerData}
          pageSize={pageSize}
          prayerData={prayerData}
          setPrayerData={setPrayerData}
          areaId={values.area}
          setIsLoadingMorePrayers={setIsLoadingMorePrayers}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      </main>
    </div>
  );
}

export default App;
