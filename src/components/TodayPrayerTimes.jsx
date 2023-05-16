import React from 'react';
import moment from 'moment';

import { useQuery } from 'react-query';
import { axiosInstance } from '../utils/helpers';
import Spinner from './ui/Spinner/Spinner';

const DATE_FORMAT = 'YYYY-MM-DD';
const getTodayPrayerTimeByDate = async ({ queryKey }) => {
  const [_, areaId] = queryKey;
  const date = moment().format(DATE_FORMAT);

  return await axiosInstance.get(`GetPrayerTimeByDate/${areaId}/${date}`);
};

const tabs = ['Yesterday', 'Today', 'Tomorrow'];

const PrayerTimesCarousel = ({ areaId, area, emirate }) => {
  const { isLoading, data } = useQuery(['getPrayerTimesByDate', areaId], getTodayPrayerTimeByDate, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  return (
    <div dir="rtl" className="mb-12">
      <h3 className="text-xl font-semibold mb-2">
        وقت الصلاة اليوم في {area ?? ''}
        {emirate ? `, ${emirate}` : ''}{' '}
      </h3>

      {!isLoading && data ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          <div className="flex flex-col items-center justify-center bg-purple-800 text-white border border-gray-200 rounded-md py-6 px-3">
            <span>فقير 🌅</span>
            <strong className="mt-1">{moment(data?.data?.result?.fajr).format('LT')}</strong>
          </div>
          <div className="flex flex-col items-center justify-center bg-blue-600 text-white border border-gray-200 rounded-md py-6 px-3">
            <span>شروق 🌄</span>
            <strong className="mt-1">{moment(data?.data?.result?.shurooq).format('LT')}</strong>
          </div>
          <div className="flex flex-col items-center justify-center bg-violet-600 text-white border border-gray-200 rounded-md py-6 px-3">
            <span>ظهر ☀️</span>
            <strong className="mt-1">{moment(data?.data?.result?.zuhr).format('LT')}</strong>
          </div>
          <div className="flex flex-col items-center justify-center bg-teal-600 text-white border border-gray-200 rounded-md py-6 px-3">
            <span>العصر 🕒</span>
            <strong className="mt-1">{moment(data?.data?.result?.asr).format('LT')}</strong>
          </div>
          <div className="flex flex-col items-center justify-center bg-indigo-600 text-white border border-gray-200 rounded-md py-6 px-3">
            <span>المغرب 🌇</span>
            <strong className="mt-1">{moment(data?.data?.result?.maghrib).format('LT')}</strong>
          </div>
          <div className="flex flex-col items-center justify-center bg-cyan-600 text-white border border-gray-200 rounded-md py-6 px-3">
            <span>العشاء 🌙</span>
            <strong className="mt-1">{moment(data?.data?.result?.isha).format('LT')}</strong>
          </div>
        </div>
      ) : (
        <div className="col-span-6 place-items-center text-center">
          {isLoading ? <Spinner className="mx-auto" /> : <strong>لا نتائج</strong>}
        </div>
      )}
    </div>
  );
};

export default PrayerTimesCarousel;
