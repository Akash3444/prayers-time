import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { hijryMonths, weekdays } from '../utils/constants';
import Spinner from './ui/Spinner/Spinner';
import { axiosInstance } from '../utils/helpers';

const tabs = ['غداً', '7 أيام', 'شهر واحد'];
const getTodayPrayerTimeByDate = async ({ areaId, date }) => {
  return await axiosInstance.get(`GetPrayerTimeByDate/${areaId}/${date}`);
};

const PrayerTimesTable = ({
  isLoadingPrayerData,
  prayerData,
  isLoadingMorePrayers,
  pageSize,
  setPrayerData,
  areaId,
  date,
  selectedTab,
  setSelectedTab,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleTabChange(selectedTab);
  }, [areaId]);

  const getLastFewDaysData = async (days) => {
    const dates = new Array(days).fill(1).map((_, index) =>
      moment(date)
        .subtract(days - index, 'd')
        .format('YYYY-DD-MM')
    );
    setIsLoading(true);
    try {
      const data = await Promise.all(
        dates.map(async (date) => {
          try {
            const res = await getTodayPrayerTimeByDate({ areaId, date });
            return res;
          } catch (error) {
            return error;
          }
        })
      );
      const newPrayerData = data.filter(({ data }) => !!data).map(({ data }) => data.result);
      setPrayerData(newPrayerData);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setSelectedTab(tab);

    if (tab === 0) {
      setIsLoading(true);
      try {
        const res = await getTodayPrayerTimeByDate({
          areaId,
          date: moment().add(1, 'd').format('YYYY-DD-MM'),
        });
        setPrayerData(res.data?.result);
      } catch (error) {
        setPrayerData([]);
      } finally {
        setIsLoading(false);
      }
    }
    if (tab === 1) getLastFewDaysData(7);
    if (tab === 2) getLastFewDaysData(30);
  };

  return (
    <div dir="rtl" className="max-w-full w-full overflow-x-auto">
      <div className="pb-3">
        <div className="flex items-center gap-2 border border-gray-200  bg-gray-100 rounded-md max-w-max p-1">
          {tabs.map((tab, index) => (
            <div
              key={tab}
              className={`${
                selectedTab === index
                  ? 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white'
                  : 'hover:bg-gray-200 text-black'
              } cursor-pointer px-4 py-1 rounded-md`}
              onClick={() => handleTabChange(index)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>
      <table className="w-full border">
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
          {!isLoadingPrayerData &&
            !isLoading &&
            (prayerData
              ? Array.isArray(prayerData)
                ? prayerData.slice(0, pageSize)
                : [prayerData]
              : []
            ).map((prayerData, index) => (
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
                  {moment(prayerData.fajr).format('LT')}
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
            ))}

          {!isLoadingPrayerData &&
            !isLoading &&
            (prayerData ? (Array.isArray(prayerData) ? prayerData : [prayerData]) : []).length ===
              0 && (
              <tr>
                <td colSpan={9} className="p-3 text-center">
                  لا نتائج
                </td>
              </tr>
            )}

          {(isLoadingPrayerData || isLoadingMorePrayers || isLoading) && (
            <tr>
              <td colSpan={9} className="py-3">
                <Spinner className="mx-auto" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrayerTimesTable;
