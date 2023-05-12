import React from 'react';

const Hero = () => {
  return (
    <div
      className="bg-black bg-[url(https://images5.alphacoders.com/115/1151921.jpg)]"
      style={{
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white/40 backdrop-blur-[1px]">
        <header className="absolute inset-x-0 top-0 z-50">
          <nav className="flex items-center justify-between gap-6 p-6 lg:px-8" aria-label="Global">
            <div className="flex lg:flex-1">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img className="h-12 w-auto" src="/logo1.png" alt="" />
              </a>
            </div>
            <div className="flex">
              <a href="#" className="-m-1.5 p-1.5">
                <img className="h-12 w-auto" src="/logo2.png" alt="" />
              </a>
            </div>
          </nav>
        </header>

        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:pb-[350px] lg:pt-20">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl sm:leading-[75px]">
                احصل على أوقات الصلاة اليومية
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-800">
                اختر الحقل الذي تريد التصفية به واحصل على قائمة بأوقات الصلاة
              </p>
              <div className="mt-8 flex items-center justify-center gap-x-6">
                <a
                  href="#start"
                  className="rounded-md bg-indigo-600 px-6 py-3 text-md font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  البدء
                </a>
              </div>
            </div>
          </div>
          <div
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
