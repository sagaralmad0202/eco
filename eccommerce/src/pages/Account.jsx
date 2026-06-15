import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import profileImage from "../assets/avatar1.webp";

const tabs = ["Settings", "Wishlists", "Orders history", "Change password", "Billing"];

const tabRoutes = {
  Settings: "/account",
  Wishlists: "/account-wishlists",
  "Orders history": "/orders",
  "Change password": "/account-password",
  Billing: "/account-billing",
};

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 7.5L7.7 5.6C8.1 5 8.8 4.6 9.6 4.6h4.8c.8 0 1.5.4 1.9 1l1.2 1.9H19c1.7 0 3 1.3 3 3v5.7c0 1.7-1.3 3-3 3H5c-1.7 0-3-1.3-3-3v-5.7c0-1.7 1.3-3 3-3h1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15.3 12.6a3.3 3.3 0 1 1-6.6 0 3.3 3.3 0 0 1 6.6 0Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M18.6 10.2h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 4v4M20 6h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FieldIcon({ type }) {
  const paths = {
    mail: (
      <>
        <path d="M4 6.75h16v10.5H4V6.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="m4.5 7.25 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    calendar: (
      <>
        <path d="M7.5 3.75v3M16.5 3.75v3M4.75 9.25h14.5M5.75 5.75h12.5c.8 0 1.5.7 1.5 1.5v10.5c0 .8-.7 1.5-1.5 1.5H5.75c-.8 0-1.5-.7-1.5-1.5V7.25c0-.8.7-1.5 1.5-1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    location: (
      <>
        <path d="M19 10.25c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14.5 10.25a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" stroke="currentColor" strokeWidth="1.5" />
      </>
    ),
    phone: (
      <path d="M8.1 5.2 9.6 8c.3.6.2 1.3-.3 1.8l-.8.8a12 12 0 0 0 4.9 4.9l.8-.8c.5-.5 1.2-.6 1.8-.3l2.8 1.5c.8.4 1.2 1.3.9 2.1-.4 1.2-1.5 2-2.8 2C9.8 20 4 14.2 4 7.1c0-1.3.8-2.4 2-2.8.8-.3 1.7.1 2.1.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  };

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[type]}
    </svg>
  );
}

function TextInput({ label, icon, ...props }) {
  return (
    <label className="block text-left">
      <span className="block text-sm font-medium text-neutral-950 dark:text-neutral-100">{label}</span>
      <div className="mt-3 flex h-[54px] items-center rounded-full border border-neutral-200 bg-white px-4 text-neutral-500 shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/15 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        {icon ? <span className="mr-3 shrink-0">{icon}</span> : null}
        <input
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] text-neutral-950 outline-none placeholder:text-neutral-500 dark:text-neutral-100"
          {...props}
        />
      </div>
    </label>
  );
}

function PlaceholderPanel({ title, description }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-8 text-left dark:border-neutral-700">
      <h2 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">{description}</p>
    </div>
  );
}

export default function Account() {
  const [activeTab, setActiveTab] = useState("Settings");

  return (
    <div className="nc-AccountPage min-h-screen bg-white font-[Poppins] text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Header height="79.2px" />
      </div>

      <main className="container pb-24">
        <div className="mt-14 sm:mt-20">
          <div className="mx-auto max-w-4xl">
            <section className="max-w-2xl text-left">
              <h1 className="text-3xl font-semibold xl:text-4xl">
                Account
              </h1>
              <span className="mt-4 block text-base text-neutral-500 sm:text-lg dark:text-neutral-400">
                <span className="font-semibold text-neutral-950 dark:text-neutral-50">Enrico Cole</span>
                {", ciseco@gmail.com "}
                <span className="text-neutral-400 dark:text-neutral-500">.</span>
                {" Los Angeles, CA"}
              </span>
            </section>

            <hr className="mt-10 w-full border-t border-neutral-200 dark:border-neutral-800" />

            <div>
              <div className="hidden-scrollbar flex gap-x-8 overflow-x-auto md:gap-x-14">
                {tabs.map((tab) => (
                  <a
                    key={tab}
                    href={tabRoutes[tab]}
                    onClick={(event) => {
                      event.preventDefault();
                      setActiveTab(tab);
                    }}
                    className={`block shrink-0 border-b-2 py-5 text-sm sm:text-base md:py-8 ${
                      activeTab === tab
                        ? "border-[#0ea5e9] font-medium text-neutral-950 dark:text-neutral-100"
                        : "border-transparent text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100"
                    }`}
                  >
                    {tab}
                  </a>
                ))}
              </div>
            </div>

            <hr className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
        </div>

        <div className="mx-auto max-w-4xl pt-14 pb-24 sm:pt-16 lg:pb-32">
          {activeTab === "Settings" ? (
            <form className="text-left">
              <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl dark:text-neutral-200">
                Account information
              </h1>

              <div className="mt-16 flex flex-col gap-10 md:flex-row md:items-start md:gap-20">
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full">
                  <img src={profileImage} alt="Enrico Cole" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 text-neutral-50">
                      <CameraIcon />
                      <span className="mt-1">Change Image</span>
                  </div>
                  <input
                    aria-label="Choose File"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    type="file"
                    name="avatar"
                  />
                </div>

                <div className="w-full space-y-8">
                  <TextInput label="Full name" type="text" defaultValue="Enrico Cole" />
                  <TextInput
                    label="Email"
                    type="email"
                    defaultValue="example@email.com"
                    icon={<FieldIcon type="mail" />}
                  />
                  <TextInput
                    label="Date of birth"
                    type="text"
                    defaultValue="10/10/1990"
                    icon={<FieldIcon type="calendar" />}
                  />
                  <TextInput
                    label="Address"
                    type="text"
                    defaultValue="Los Angeles, CA"
                    icon={<FieldIcon type="location" />}
                  />

                  <label className="block text-left">
                    <span className="block text-sm font-medium text-neutral-950 dark:text-neutral-100">Gender</span>
                    <div className="mt-3">
                      <select className="h-[54px] w-full rounded-full border border-neutral-200 bg-white px-4 text-[15px] text-neutral-950 shadow-[0_1px_2px_rgba(15,23,42,0.08)] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </label>

                  <TextInput
                    label="Phone number"
                    type="tel"
                    defaultValue="+1 555 888 999"
                    icon={<FieldIcon type="phone" />}
                  />

                  <label className="block text-left">
                    <span className="block text-sm font-medium text-neutral-950 dark:text-neutral-100">About you</span>
                    <textarea
                      rows="5"
                      defaultValue="Hello, this is my account profile. I love clean fashion, simple products, and fast checkout experiences."
                      className="mt-3 w-full resize-none rounded-3xl border border-neutral-200 bg-white px-5 py-4 text-[15px] leading-6 text-neutral-950 shadow-[0_1px_2px_rgba(15,23,42,0.08)] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </label>

                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-neutral-900 px-8 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                  >
                    Update account
                  </button>
                </div>
              </div>
            </form>
          ) : null}

          {activeTab === "Wishlists" ? (
            <PlaceholderPanel
              title="Wishlists"
              description="Saved products and favorite collections will appear here."
            />
          ) : null}

          {activeTab === "Orders history" ? (
            <PlaceholderPanel
              title="Orders history"
              description="Recent orders, delivery status, and purchase details will appear here."
            />
          ) : null}

          {activeTab === "Change password" ? (
            <PlaceholderPanel
              title="Change password"
              description="Password update controls will appear here."
            />
          ) : null}

          {activeTab === "Billing" ? (
            <PlaceholderPanel
              title="Billing"
              description="Saved payment methods, billing addresses, and invoices will appear here."
            />
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
