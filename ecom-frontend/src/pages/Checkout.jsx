import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

import p1 from "../assets/p1.webp";
import p2 from "../assets/p3.webp";

const checkoutItems = [
  { id: 1, name: "Basic Tee", slug: "basic-tee", color: "Sienna", size: "L", price: 199.0, quantity: 1, image: p1 },
  { id: 2, name: "Basic Coahuila", slug: "basic-coahuila", color: "Black", size: "XL", price: 99.0, quantity: 1, image: p1 },
  { id: 3, name: "Nomad Tumbler", slug: "nomad-tumbler", color: "White", size: "M", price: 119.0, quantity: 1, image: p2 },
];

export default function Checkout() {
  const [activeTab, setActiveTab] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [shippingForm, setShippingForm] = useState({
    firstName: "Cole",
    lastName: "Enrico",
    address: "123, Dream Avenue, USA",
    aptSuite: "55U - DD5",
    city: "Norris",
    country: "United States",
    stateProvince: "Texas",
    postalCode: "2500",
    addressType: "Home",
    phone: "+855-666-7744",
    email: "enrico@example.com",
  });

  const [items, setItems] = useState(checkoutItems);

  const updateQuantity = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingEstimate = 5.0;
  const taxEstimate = 24.9;
  const orderTotal = subtotal + shippingEstimate + taxEstimate;

  return (
    <div className="nc-CheckoutPage">
      <div className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <Header height="79.2px" />
      </div>

      <main className="container px-4 sm:px-8 py-8 sm:py-16 lg:pt-20 lg:pb-28">
        {/* Heading + Breadcrumb */}
        <div className="mb-6 sm:mb-16">
          <h1 className="mb-3.5 sm:mb-5 block text-3xl font-semibold lg:text-4xl">Checkout</h1>
          <nav aria-label="Breadcrumb" className="text-xs font-medium text-neutral-900 sm:text-sm/6 dark:text-neutral-300">
            <ol role="list" className="flex flex-wrap items-center gap-1 sm:gap-3.5">
              <li>
                <div className="flex items-center gap-1 sm:gap-3.5">
                  <Link to="/" className="text-neutral-900 dark:text-neutral-300 hover:text-neutral-600">Home</Link>
                  <span className="sm:hidden text-neutral-400 dark:text-neutral-500 select-none mx-2">/</span>
                  <svg viewBox="0 0 6 20" aria-hidden="true" className="hidden sm:block h-5 w-auto text-neutral-400 dark:text-neutral-500"><path d="M4.878 4.34L1.122 16.536" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-1 sm:gap-3.5">
                  <Link to="/cart" className="text-neutral-900 dark:text-neutral-300 hover:text-neutral-600">Cart</Link>
                  <span className="sm:hidden text-neutral-400 dark:text-neutral-500 select-none mx-2">/</span>
                  <svg viewBox="0 0 6 20" aria-hidden="true" className="hidden sm:block h-5 w-auto text-neutral-400 dark:text-neutral-500"><path d="M4.878 4.34L1.122 16.536" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </li>
              <li><span aria-current="page" className="text-neutral-500 dark:text-neutral-400 ml-1 sm:ml-0">Checkout</span></li>
            </ol>
          </nav>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row">
          {/* Left: Form */}
          <div className="flex-1">
            <div className="space-y-8">

              {/* ── CONTACT INFORMATION ── */}
              <div id="ContactInfo" className="scroll-mt-5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" className="sm:mt-1.5">
                    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5"></path>
                    <path d="M14.75 9.5C14.75 11.0188 13.5188 12.25 12 12.25C10.4812 12.25 9.25 11.0188 9.25 9.5C9.25 7.98122 10.4812 6.75 12 6.75C13.5188 6.75 14.75 7.98122 14.75 9.5Z" stroke="currentColor" strokeWidth="1.5"></path>
                    <path d="M5.49994 19.0001L6.06034 18.0194C6.95055 16.4616 8.60727 15.5001 10.4016 15.5001H13.5983C15.3926 15.5001 17.0493 16.4616 17.9395 18.0194L18.4999 19.0001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                  </svg>
                  <div className="sm:pl-3">
                    <h3 className="flex items-center gap-3 text-neutral-700 dark:text-neutral-400">
                      <span className="tracking-tight uppercase">Contact information</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" className="mb-1 text-sky-500">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </h3>
                    <div className="mt-1 text-sm font-semibold">Enrico Smith / {shippingForm.phone}</div>
                  </div>
                  <button onClick={() => setActiveTab(2)} className="rounded-full bg-neutral-50 px-4 py-2 text-sm font-medium hover:bg-neutral-100 sm:ml-auto dark:bg-neutral-800 dark:hover:bg-neutral-700" type="button">Change</button>
                </div>

                {/* Expanded Form */}
                <div className={`border-t border-neutral-200 px-4 py-7 sm:px-6 dark:border-neutral-700 ${activeTab !== 2 ? "hidden" : ""}`}>
                  <div className="space-y-6">
                    {/* Header with inline login */}
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-lg font-semibold text-left">Contact information</h3>
                      <p className="text-sm text-neutral-900 dark:text-neutral-100 text-left">
                        Do not have an account?{" "}
                        <Link to="/login" className="font-medium underline">
                          Log in
                        </Link>
                      </p>
                    </div>

                    {/* Fields */}
                    <form onSubmit={(e) => { e.preventDefault(); setActiveTab(0); }} className="space-y-6">
                      {/* Phone number */}
                      <div className="max-w-lg text-left">
                        <label htmlFor="phone-number" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                          Your phone number
                        </label>
                        <div className="mt-1.5">
                          <input
                            type="text"
                            name="phone"
                            id="phone-number"
                            placeholder="+808 xxx"
                            value={shippingForm.phone}
                            onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                            className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Email address */}
                      <div className="max-w-lg text-left">
                        <label htmlFor="email-address" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                          Email address
                        </label>
                        <div className="mt-1.5">
                          <input
                            type="email"
                            name="email"
                            id="email-address"
                            value={shippingForm.email}
                            onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                            className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div className="flex items-center gap-x-3 text-left">
                        <input
                          id="email-offers"
                          type="checkbox"
                          className="h-5 w-5 rounded border border-neutral-300 bg-white text-neutral-900 focus:ring-neutral-900 accent-neutral-900 cursor-pointer dark:border-neutral-700 dark:bg-neutral-900"
                          defaultChecked
                        />
                        <label htmlFor="email-offers" className="text-sm font-medium text-neutral-900 dark:text-neutral-200 cursor-pointer select-none">
                          Email me news and offers
                        </label>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col gap-4 pt-6 text-left items-start sm:flex-row sm:gap-2.5 sm:items-center border-t border-neutral-100 dark:border-neutral-800">
                        <button
                          type="submit"
                          className="relative inline-flex items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 px-6 py-3 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors w-auto min-w-56 sm:min-w-0"
                        >
                          Next to shipping address
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab(0)}
                          className="relative inline-flex items-center justify-center rounded-full border border-transparent bg-transparent px-[15px] py-[9px] sm:px-6 sm:py-3 text-sm font-medium text-neutral-900 dark:text-neutral-200 hover:text-neutral-600 sm:hover:bg-neutral-100 sm:dark:hover:bg-neutral-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* ── SHIPPING ADDRESS ── */}
              <div id="ShippingAddress" className="scroll-mt-5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" className="sm:mt-1.5">
                    <path d="M18.7185 10.7151C18.5258 10.8979 18.2682 11 18.0001 11C17.732 11 17.4744 10.8979 17.2817 10.7151C15.5167 9.03169 13.1515 7.15111 14.305 4.42805C14.9206 2.94462 16.4257 2 18.0001 2C19.5745 2 21.0796 2.94462 21.6952 4.42805C22.8487 7.14767 20.4878 9.03749 18.7185 10.7151" stroke="currentColor" strokeWidth="1.5"></path>
                    <path d="M18 6H18.009" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    <circle cx="5" cy="19" r="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></circle>
                    <path d="M11 7H9.5C7 7 6 8.34315 6 10C6 11.6569 7.567 13 9.5 13H12.5C14.433 13 16 14.3431 16 16C16 17.6569 14.6569 19 12.5 19H11" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path>
                  </svg>
                  <div className="sm:pl-3">
                    <h3 className="flex items-center gap-3 text-neutral-700 dark:text-neutral-400">
                      <span className="tracking-tight uppercase">Shipping address</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" className={`mb-1 text-sky-500 ${activeTab === 0 ? "block sm:hidden" : "block"}`}>
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </h3>
                    <div className={`mt-1 text-sm font-semibold ${activeTab === 0 ? "block sm:hidden" : "block"}`}>St. Paul&apos;s Road, Norris, SD 57560, Dakota, USA</div>
                  </div>
                  <button onClick={() => setActiveTab(0)} className="rounded-full bg-neutral-50 px-4 py-2 text-sm font-medium hover:bg-neutral-100 sm:ml-auto dark:bg-neutral-800 dark:hover:bg-neutral-700" type="button">Change</button>
                </div>

                <div className={`border-t border-neutral-200 px-4 py-7 sm:px-6 dark:border-neutral-700 ${activeTab !== 0 ? "hidden" : ""}`}>
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-12 sm:gap-x-4">
                    {/* First name */}
                    <div className="sm:col-span-6">
                      <label htmlFor="first-name" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left">
                        First name
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="firstName"
                          id="first-name"
                          value={shippingForm.firstName}
                          onChange={(e) => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Last name */}
                    <div className="sm:col-span-6">
                      <label htmlFor="last-name" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left">
                        Last name
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="lastName"
                          id="last-name"
                          value={shippingForm.lastName}
                          onChange={(e) => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-8">
                      <label htmlFor="address" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left">
                        Address
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="address"
                          id="address"
                          value={shippingForm.address}
                          onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Apt, Suite * */}
                    <div className="sm:col-span-4">
                      <label htmlFor="apt-suite" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left">
                        Apt, Suite *
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="aptSuite"
                          id="apt-suite"
                          value={shippingForm.aptSuite}
                          onChange={(e) => setShippingForm({ ...shippingForm, aptSuite: e.target.value })}
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="sm:col-span-6">
                      <label htmlFor="city" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left">
                        City
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="city"
                          id="city"
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Country */}
                    <div className="sm:col-span-6">
                      <label htmlFor="country" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left">
                        Country
                      </label>
                      <div className="mt-1.5 relative">
                        <select
                          id="country"
                          name="country"
                          value={shippingForm.country}
                          onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 appearance-none pr-10"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="Mexico">Mexico</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="sm:hidden h-5 w-5 text-neutral-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                          </svg>
                          <svg className="hidden sm:block h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* State/Province */}
                    <div className="sm:col-span-6">
                      <label htmlFor="state" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left">
                        State/Province
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="stateProvince"
                          id="state"
                          value={shippingForm.stateProvince}
                          onChange={(e) => setShippingForm({ ...shippingForm, stateProvince: e.target.value })}
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Postal code */}
                    <div className="sm:col-span-6">
                      <label htmlFor="postal-code" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left">
                        Postal code
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          name="postalCode"
                          id="postal-code"
                          value={shippingForm.postalCode}
                          onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                          className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Address type & Buttons Wrapper */}
                    <div className="sm:col-span-12 text-left">
                      {/* Address type */}
                      <div className="max-w-lg mb-8 text-left">
                        <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 text-left">
                          Address type
                        </label>
                        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:gap-8">
                          <label className="flex items-center cursor-pointer select-none">
                            <input
                              type="radio"
                              name="addressType"
                              value="Home"
                              checked={shippingForm.addressType === "Home"}
                              onChange={() => setShippingForm({ ...shippingForm, addressType: "Home" })}
                              className="sr-only"
                            />
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-neutral-950 transition-all ${shippingForm.addressType === "Home" ? "border-[6px] border-neutral-900 dark:border-neutral-100" : "border-2 border-neutral-300 dark:border-neutral-600"}`} />
                            <span className="ml-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              Home <span className="text-neutral-500 dark:text-neutral-400 font-normal">(All Day Delivery)</span>
                            </span>
                          </label>

                          <label className="flex items-center cursor-pointer select-none">
                            <input
                              type="radio"
                              name="addressType"
                              value="Office"
                              checked={shippingForm.addressType === "Office"}
                              onChange={() => setShippingForm({ ...shippingForm, addressType: "Office" })}
                              className="sr-only"
                            />
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-neutral-950 transition-all ${shippingForm.addressType === "Office" ? "border-[6px] border-neutral-900 dark:border-neutral-100" : "border-2 border-neutral-300 dark:border-neutral-600"}`} />
                            <span className="ml-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              Office <span className="text-neutral-500 dark:text-neutral-400 font-normal">(Delivery 9 AM - 5 PM)</span>
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-4 pt-6 text-left items-start sm:flex-row sm:gap-2.5 sm:items-center">
                        <button
                          type="button"
                          onClick={() => setActiveTab(1)}
                          className="relative inline-flex items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 px-6 py-3 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors w-auto min-w-56 sm:min-w-0"
                        >
                          Next to payment method
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab(1)}
                          className="relative inline-flex items-center justify-center rounded-full border border-transparent bg-transparent px-[15px] py-[9px] sm:px-6 sm:py-3 text-sm font-medium text-neutral-900 dark:text-neutral-200 hover:text-neutral-600 sm:hover:bg-neutral-100 sm:dark:hover:bg-neutral-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── PAYMENT METHOD ── */}
              <div id="PaymentMethod" className="scroll-mt-5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" className="sm:mt-1.5">
                    <path d="M3.3457 16.1976L16.1747 3.36866M18.6316 11.0556L14.5549 15.1099L13.5762 16.0886" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
                    <path d="M3.17467 16.1411C1.60844 14.5749 1.60844 12.0355 3.17467 10.4693L10.4693 3.17467C12.0355 1.60844 14.5749 1.60844 16.1411 3.17467L20.8253 7.85891C22.3916 9.42514 22.3916 11.9645 20.8253 13.5307L13.5307 20.8253C11.9645 22.3916 9.42514 22.3916 7.85891 20.8253L3.17467 16.1411Z" stroke="currentColor" strokeWidth="1.5"></path>
                    <path d="M4 22H20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
                  </svg>
                  <div className="sm:pl-3">
                    <h3 className="flex items-center gap-3 text-neutral-700 dark:text-neutral-400">
                      <span className="tracking-tight uppercase">Payment method</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" className="mb-1 text-sky-500">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </h3>
                    <div className="mt-1 text-sm font-semibold">Credit Card / xxx-xxx-xx55</div>
                  </div>
                  <button onClick={() => setActiveTab(1)} className="rounded-full bg-neutral-50 px-4 py-2 text-sm font-medium hover:bg-neutral-100 sm:ml-auto dark:bg-neutral-800 dark:hover:bg-neutral-700" type="button">Change</button>
                </div>

                {/* Payment options */}
                <div className={`border-t border-neutral-200 px-4 py-7 sm:px-6 dark:border-neutral-700 ${activeTab !== 1 ? "hidden" : ""}`}>
                  <div className="space-y-4">
                    {/* Debit / Credit Card */}
                    <div className="space-y-4">
                      <label className="flex items-center gap-x-4 sm:gap-x-6 text-sm font-medium text-neutral-900 dark:text-white select-none cursor-pointer">
                        <input type="radio" name="payment" value="credit" checked={paymentMethod === "credit"} onChange={() => setPaymentMethod("credit")} className="sr-only" />
                        <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-all ${paymentMethod === "credit" ? "border-[5px] border-neutral-900 dark:border-neutral-100" : "border border-neutral-300 dark:border-neutral-600"}`} />
                        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-2.5 bg-white dark:bg-neutral-800 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" className="text-neutral-700 dark:text-neutral-300">
                            <path d="M2 12C2 8.46957 2 6.70435 3.09763 5.60673C4.19526 4.5091 5.96048 4.5091 9.49091 4.5091H14.5091C18.0395 4.5091 19.8047 4.5091 20.9024 5.60673C22 6.70435 22 8.46957 22 12V14.5091C22 18.0395 22 19.8047 20.9024 20.9024C19.8047 22 18.0395 22 14.5091 22H9.49091C5.96048 22 4.19526 22 3.09763 20.9024C2 19.8047 2 18.0395 2 14.5091V12Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M2 10.1115H22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                            <path d="M10 16H11.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                            <path d="M14.5 16L18 16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                            <path d="M2 9H22" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5"></path>
                          </svg>
                        </div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 sm:text-base">Debit / Credit Card</p>
                      </label>

                      {/* Card payment details nested inside option */}
                      {paymentMethod === "credit" && (
                        <div className="space-y-5 py-6 pl-0 sm:pl-10 block">
                          {/* Card number */}
                          <div className="text-left w-full sm:max-w-lg">
                            <label htmlFor="card-number" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                              Card number
                            </label>
                            <div className="mt-1.5">
                              <input
                                type="text"
                                id="card-number"
                                className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Name on Card */}
                          <div className="text-left w-full sm:max-w-lg">
                            <label htmlFor="card-name" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                              Name on Card
                            </label>
                            <div className="mt-1.5">
                              <input
                                type="text"
                                id="card-name"
                                className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Expiration date + CVC */}
                          <div className="flex flex-col sm:flex-row gap-5 sm:gap-4">
                            <div className="w-full sm:w-2/3 text-left">
                              <label htmlFor="card-expiry" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                Expiration date (MM/YY)
                              </label>
                              <div className="mt-1.5">
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  id="card-expiry"
                                  className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div className="w-full sm:w-1/3 text-left">
                              <label htmlFor="card-cvc" className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                CVC
                              </label>
                              <div className="mt-1.5">
                                <input
                                  type="text"
                                  placeholder="CVC"
                                  id="card-cvc"
                                  className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Internet banking */}
                    <div>
                      <label className="flex items-center gap-x-4 sm:gap-x-6 text-sm font-medium text-neutral-900 dark:text-white select-none cursor-pointer">
                        <input type="radio" name="payment" value="banking" checked={paymentMethod === "banking"} onChange={() => setPaymentMethod("banking")} className="sr-only" />
                        <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-all ${paymentMethod === "banking" ? "border-[5px] border-neutral-900 dark:border-neutral-100" : "border border-neutral-300 dark:border-neutral-600"}`} />
                        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-2.5 bg-white dark:bg-neutral-800 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" className="text-neutral-700 dark:text-neutral-300">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                            <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M2 12H22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                          </svg>
                        </div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 sm:text-base">Internet banking</p>
                      </label>

                      {/* Bank transfer details nested inside option */}
                      {paymentMethod === "banking" && (
                        <div className="py-6 pl-0 sm:pl-10 block">
                          <h2 className="text-base font-semibold text-neutral-900 dark:text-white sm:text-sm text-left">
                            Your order will be delivered to you after you transfer to
                          </h2>
                          <dl className="mt-3.5 grid grid-cols-1 sm:grid-cols-[min(50%,20rem)_auto] text-base sm:text-sm">
                            {/* Customer */}
                            <dt className="col-start-1 border-t border-neutral-200/50 dark:border-neutral-700/50 pt-3 text-neutral-500 dark:text-neutral-400 first:border-none first:pt-0 sm:border-neutral-200/50 sm:py-3 sm:dark:border-neutral-700/50 text-left">
                              Customer
                            </dt>
                            <dd className="pt-1 pb-3 text-neutral-900 dark:text-white font-medium sm:border-t sm:border-neutral-200/50 dark:sm:border-neutral-700/50 sm:py-3 sm:border-t-0 text-left">
                              BooliiTheme
                            </dd>

                            {/* Bank name */}
                            <dt className="col-start-1 border-t border-neutral-200/50 dark:border-neutral-700/50 pt-3 text-neutral-500 dark:text-neutral-400 sm:border-neutral-200/50 sm:py-3 sm:dark:border-neutral-700/50 text-left">
                              Bank name
                            </dt>
                            <dd className="pt-1 pb-3 text-neutral-900 dark:text-white font-medium sm:border-t sm:border-neutral-200/50 dark:sm:border-neutral-700/50 sm:py-3 text-left">
                              Example Bank Name
                            </dd>

                            {/* Account number */}
                            <dt className="col-start-1 border-t border-neutral-200/50 dark:border-neutral-700/50 pt-3 text-neutral-500 dark:text-neutral-400 sm:border-neutral-200/50 sm:py-3 sm:dark:border-neutral-700/50 text-left">
                              Account number
                            </dt>
                            <dd className="pt-1 pb-3 text-neutral-900 dark:text-white font-medium sm:border-t sm:border-neutral-200/50 dark:sm:border-neutral-700/50 sm:py-3 text-left">
                              555 888 777
                            </dd>

                            {/* Sort code */}
                            <dt className="col-start-1 border-t border-neutral-200/50 dark:border-neutral-700/50 pt-3 text-neutral-500 dark:text-neutral-400 sm:border-neutral-200/50 sm:py-3 sm:dark:border-neutral-700/50 text-left">
                              Sort code
                            </dt>
                            <dd className="pt-1 pb-3 text-neutral-900 dark:text-white font-medium sm:border-t sm:border-neutral-200/50 dark:sm:border-neutral-700/50 sm:py-3 text-left">
                              999
                            </dd>

                            {/* IBAN */}
                            <dt className="col-start-1 border-t border-neutral-200/50 dark:border-neutral-700/50 pt-3 text-neutral-500 dark:text-neutral-400 sm:border-neutral-200/50 sm:py-3 sm:dark:border-neutral-700/50 text-left">
                              IBAN
                            </dt>
                            <dd className="pt-1 pb-3 text-neutral-900 dark:text-white font-medium sm:border-t sm:border-neutral-200/50 dark:sm:border-neutral-700/50 sm:py-3 text-left">
                              IBAN
                            </dd>

                            {/* BIC */}
                            <dt className="col-start-1 border-t border-neutral-200/50 dark:border-neutral-700/50 pt-3 text-neutral-500 dark:text-neutral-400 sm:border-neutral-200/50 sm:py-3 sm:dark:border-neutral-700/50 text-left">
                              BIC
                            </dt>
                            <dd className="pt-1 pb-3 text-neutral-900 dark:text-white font-medium sm:border-t sm:border-neutral-200/50 dark:sm:border-neutral-700/50 sm:py-3 text-left">
                              BIC/Swift
                            </dd>
                          </dl>
                        </div>
                      )}
                    </div>

                    {/* Wallet */}
                    <div>
                      <label className="flex items-center gap-x-4 sm:gap-x-6 text-sm font-medium text-neutral-900 dark:text-white select-none cursor-pointer">
                        <input type="radio" name="payment" value="wallet" checked={paymentMethod === "wallet"} onChange={() => setPaymentMethod("wallet")} className="sr-only" />
                        <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-all ${paymentMethod === "wallet" ? "border-[5px] border-neutral-900 dark:border-neutral-100" : "border border-neutral-300 dark:border-neutral-600"}`} />
                        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-2.5 bg-white dark:bg-neutral-800 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" className="text-neutral-700 dark:text-neutral-300">
                            <path d="M19 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                            <path d="M21 11H17C15.8954 11 15 11.8954 15 13C15 14.1046 15.8954 15 17 15H21" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                            <path d="M3 13H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                            <path d="M17 7V5C17 3.89543 16.1046 3 15 3H7C5.89543 3 5 3.89543 5 5V7" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                          </svg>
                        </div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 sm:text-base">Google / Apple Wallet</p>
                      </label>

                      {/* Wallet details nested inside option */}
                      {paymentMethod === "wallet" && (
                        <div className="py-6 pl-0 sm:pl-10 block">
                          <p className="text-neutral-600 dark:text-neutral-400 text-sm/6 text-left max-w-2xl">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque dolore quod quas fugit perspiciatis architecto, temporibus quos ducimus libero explicabo?
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card payment details nested inside option above */}

                  {/* Action Buttons for Payment Method */}
                  <div className="flex flex-col gap-4 pt-6 text-left items-start sm:flex-row sm:gap-2.5 sm:items-center sm:border-t border-neutral-200 dark:border-neutral-700 mt-8">
                    <button
                      type="button"
                      className="relative inline-flex items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 px-6 py-3 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors w-auto min-w-56 sm:min-w-0"
                    >
                      Confirm order
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab(0)}
                      className="relative inline-flex items-center justify-center rounded-full border border-transparent bg-transparent px-[15px] py-[9px] sm:px-6 sm:py-3 text-sm font-medium text-neutral-900 dark:text-neutral-200 hover:text-neutral-600 sm:hover:bg-neutral-100 sm:dark:hover:bg-neutral-800 transition-colors"
                    >
                      Back to shipping address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-10 shrink-0 border-t border-neutral-200 lg:mx-10 lg:my-0 lg:border-t-0 lg:border-l xl:mx-16 dark:border-neutral-700"></div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[36%]">
            <div className="sticky top-28">
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif', fontSize: "18px", color: "#111827", margin: 0 }}>Order summary</h3>

              {/* Product list */}
              <div className="mt-7 sm:divide-y divide-neutral-200/70 dark:divide-neutral-700/80">
                {items.map((item) => (
                  <div key={item.id} className="relative flex py-6 sm:py-10 xl:py-12 first:pt-0 last:pb-0">
                    {/* Product Image */}
                    <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-32">
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain object-center p-2" />
                      <Link to={`/products/${item.slug}`} className="absolute inset-0"></Link>
                    </div>

                    {/* Product Details & Actions */}
                    <div className="ml-3 flex flex-1 flex-col sm:ml-6 text-left">
                      {/* Top section: Info + Price */}
                      <div>
                        <div className="flex justify-between">
                          <div className="flex-[1.5]">
                            <h3 className="text-base font-semibold">
                              <Link to={`/products/${item.slug}`}>{item.name}</Link>
                            </h3>
                            <div className="mt-1.5 flex text-sm text-neutral-600 dark:text-neutral-300 sm:mt-2.5 flex-row sm:items-center gap-x-4 sm:gap-x-0">
                              {/* Color */}
                              <div className="flex items-center gap-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500 dark:text-neutral-400">
                                  <path d="M19 12.1294L12.9388 18.207C11.1557 19.9949 10.2641 20.8889 9.16993 20.9877C8.98904 21.0041 8.80705 21.0041 8.62616 20.9877C7.53195 20.8889 6.64039 19.9949 4.85726 18.207L2.83687 16.1811C1.72104 15.0622 1.72104 13.2482 2.83687 12.1294M19 12.1294H2.83687M10.9184 4.02587L2.83687 12.1294M10.9184 4.02587L8.89805 2M10.9184 4.02587L19 12.1294" />
                                  <path d="M22 20C22 21.1046 21.1046 22 20 22C18.8954 22 18 21.1046 18 20C18 18.8954 20 17 20 17C20 17 22 18.8954 22 20Z" />
                                </svg>
                                <span>{item.color}</span>
                              </div>
                              {/* Separator */}
                              <span className="hidden sm:block mx-4 h-4 border-l border-neutral-200 dark:border-neutral-700"></span>
                              {/* Size */}
                              <div className="flex items-center gap-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500 dark:text-neutral-400">
                                  <path d="M4.00781 4.99913C4.59743 4.39256 6.16671 2.80849 7.00666 2.80849C7.84661 2.80849 9.41589 4.39256 10.0055 4.99913M7.00666 2.84907V21.9995" />
                                  <path d="M19.0023 13.995C19.6088 14.5846 22.0011 16.1538 22.0011 16.9937C22.0011 17.8336 19.6088 19.4028 19.0023 19.9923M21.1906 16.9939H1.99805" />
                                </svg>
                                <span>{item.size}</span>
                              </div>
                            </div>

                            {/* Mobile: Quantity dropdown + Price badge */}
                            <div className="mt-3 flex w-full items-center justify-between sm:hidden">
                              <select
                                name="qty"
                                id="qty"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value, 10);
                                  updateQuantity(item.id, newQty - item.quantity);
                                }}
                                className="form-select rounded-md bg-white px-2 py-1 text-xs outline-1 outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-neutral-800"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center rounded-lg border border-green-500 sm:border-2 py-1 px-2 text-sm font-medium text-green-500">
                                <span className="leading-none">${item.price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Price Badge */}
                          <div className="hidden flex-1 justify-end sm:flex">
                            <div className="mt-0.5">
                              <div className="flex items-center rounded-lg border-2 border-green-500 py-1 px-2 text-sm font-medium text-green-500 h-fit">
                                <span className="leading-none">${item.price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom section: Quantity + Remove */}
                      <div className="mt-auto flex items-end justify-between pt-2 sm:pt-4 text-sm">
                        {/* Quantity Controls - Desktop */}
                        <div className="hidden text-center sm:block">
                          <div className="flex items-center justify-between gap-x-5 w-full">
                            <div className="flex items-center justify-between sm:w-28">
                              <button
                                className="flex size-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-none disabled:cursor-default disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 dark:disabled:hover:border-neutral-500"
                                type="button"
                                disabled={item.quantity <= 1}
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <span className="block flex-1 text-center leading-none select-none">{item.quantity}</span>
                              <button
                                className="flex size-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-none disabled:cursor-default disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 dark:disabled:hover:border-neutral-500"
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Remove link */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="relative z-10 mt-3 flex items-center text-sm font-medium text-sky-600 hover:text-sky-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount code */}
              <div className="mt-8">
                <label className="text-sm font-medium text-neutral-900 dark:text-neutral-300 text-left block">
                  Discount code
                </label>
                <div className="mt-1.5 flex gap-3">
                  <input
                    type="text"
                    placeholder="Discount code"
                    className="relative block w-full appearance-none rounded-full px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 placeholder:text-zinc-500 sm:text-sm/6 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    className="flex w-24 items-center justify-center rounded-full border border-neutral-200/80 bg-neutral-50 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="mt-4">
                <div className="flex justify-between py-2.5">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Subtotal</span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Shipping estimate</span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">${shippingEstimate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Tax estimate</span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">${taxEstimate.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-2.5">
                  <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Order total</span>
                  <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">${orderTotal.toFixed(2)}</span>
                </div>

                <button type="button" className="mt-8 w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-full py-4 hover:bg-neutral-800 dark:hover:bg-white transition-colors" style={{ fontFamily: 'Poppins, sans-serif', fontSize: "14px", fontWeight: 600 }}>
                  Confirm order
                </button>

                <div className="mt-5 flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
                  <p className="relative block pl-5" style={{ fontFamily: 'Poppins, sans-serif', fontSize: "14px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute top-0.5 -left-1" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    Learn more{" "}
                    <a href="#" className="font-medium text-neutral-900 underline dark:text-neutral-200" style={{ textUnderlineOffset: "2px" }}>Taxes</a>{" "}
                    and{" "}
                    <a href="#" className="font-medium text-neutral-900 underline dark:text-neutral-200" style={{ textUnderlineOffset: "2px" }}>Shipping</a>{" "}
                    infomation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
