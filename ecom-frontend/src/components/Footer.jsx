import React from "react";

const widgetMenus = [
  {
    id: "5",
    title: "Getting started",
    menus: [
      { href: "#", label: "Release Notes" },
      { href: "#", label: "Upgrade Guide" },
      { href: "#", label: "Browser Support" },
      { href: "#", label: "Dark Mode" },
    ],
  },
  {
    id: "1",
    title: "Explore",
    menus: [
      { href: "#", label: "Prototyping" },
      { href: "#", label: "Design systems" },
      { href: "#", label: "Pricing" },
      { href: "#", label: "Security" },
    ],
  },
  {
    id: "2",
    title: "Resources",
    menus: [
      { href: "#", label: "Best practices" },
      { href: "#", label: "Support" },
      { href: "#", label: "Developers" },
      { href: "#", label: "Learn design" },
    ],
  },
  {
    id: "4",
    title: "Community",
    menus: [
      { href: "#", label: "Discussion Forums" },
      { href: "#", label: "Code of Conduct" },
      { href: "#", label: "Contributing" },
      { href: "#", label: "API Reference" },
    ],
  },
];

const socials = [
  {
    name: "Facebook",
    icon: (
      <svg className="w-5 h-auto shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#1877F2" />
        <path d="M13.1 7.5H15V5h-2.2C10.7 5 9.6 6.3 9.6 8.4V10H8v2.7h1.6V19h2.9v-6.3h2.2l.4-2.7h-2.6V8.7c0-.8.2-1.2 1.1-1.2Z" fill="white" />
      </svg>
    ),
    href: "#",
  },
  {
    name: "Youtube",
    icon: (
      <svg className="w-5 h-auto shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#FF0000" />
        <path d="M9.5 8.8V15.2L15.2 12L9.5 8.8Z" fill="white" />
      </svg>
    ),
    href: "#",
  },
  {
    name: "Telegram",
    icon: (
      <svg className="w-5 h-auto shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#2CA5E0" />
        <path d="M17.3 7.6L15.7 16.2C15.6 16.9 15.2 17.1 14.6 16.8L11.8 14.7L10.4 16.1C10.2 16.3 10.1 16.4 9.9 16.4L10.1 13.5L15.4 8.7C15.6 8.5 15.3 8.4 15 8.6L8.4 12.8L5.6 11.9C5 11.7 5 11.3 5.7 11L16.5 6.8C17 6.6 17.5 6.9 17.3 7.6Z" fill="white" />
      </svg>
    ),
    href: "#",
  },
  {
    name: "Twitter",
    icon: (
      <svg className="w-5 h-auto shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#1DA1F2" />
        <path d="M18.2 8.1c-.5.2-1.1.4-1.7.5.6-.4 1.1-1 1.3-1.6-.6.3-1.2.6-1.9.7-.5-.6-1.3-.9-2.1-.9-1.6 0-2.9 1.3-2.9 2.9 0 .2 0 .4.1.7-2.4-.1-4.6-1.3-6-3-.2.4-.4.9-.4 1.5 0 1 .5 1.9 1.3 2.4-.5 0-.9-.1-1.3-.4v.1c0 1.4 1 2.6 2.3 2.8-.2.1-.5.1-.8.1-.2 0-.4 0-.6-.1.4 1.1 1.4 2 2.7 2-1 .8-2.3 1.3-3.6 1.3-.2 0-.5 0-.7-.1 1.3.8 2.8 1.3 4.4 1.3 5.3 0 8.2-4.4 8.2-8.2v-.4c.6-.4 1.1-1 1.5-1.6z" fill="white" />
      </svg>
    ),
    href: "#",
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-neutral-200 dark:border-neutral-700 py-20 lg:pt-28 lg:pb-24">
      <div className="container mx-auto px-4 sm:px-8 text-left grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
        
        {/* Column 1: Logo and Socials */}
        <div className="col-span-2 grid grid-cols-4 gap-5 md:col-span-4 lg:flex lg:flex-col lg:col-span-1">
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex shrink-0 text-neutral-950 dark:text-neutral-50">
              <svg
              width="112"
              height="44"
              viewBox="0 0 112 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 37C23.2843 37 30 30.2843 30 22C30 13.7157 23.2843 7 15 7C6.71573 7 0 13.7157 0 22C0 30.2843 6.71573 37 15 37Z"
                fill="black"
              />
              <rect
                x="23.8064"
                y="10.0613"
                width="2"
                height="20"
                rx="1"
                transform="rotate(50.5422 23.8064 10.0613)"
                fill="white"
              />
              <rect
                x="21.5823"
                y="19.8572"
                width="2"
                height="20"
                rx="1"
                transform="rotate(50.5422 21.5823 19.8572)"
                fill="white"
              />
              <path
                d="M57.537 22.2C57.537 22.8933 57.497 23.6267 57.417 24.4H39.897C40.0304 26.56 40.7637 28.2533 42.097 29.48C43.457 30.68 45.097 31.28 47.017 31.28C48.5904 31.28 49.897 30.92 50.937 30.2C52.0037 29.4533 52.7504 28.4667 53.177 27.24H57.097C56.5104 29.3467 55.337 31.0667 53.577 32.4C51.817 33.7067 49.6304 34.36 47.017 34.36C44.937 34.36 43.0704 33.8933 41.417 32.96C39.7904 32.0267 38.5104 30.7067 37.577 29C36.6437 27.2667 36.177 25.2667 36.177 23C36.177 20.7333 36.6304 18.7467 37.537 17.04C38.4437 15.3333 39.7104 14.0267 41.337 13.12C42.9904 12.1867 44.8837 11.72 47.017 11.72C49.097 11.72 50.937 12.1733 52.537 13.08C54.137 13.9867 55.3637 15.24 56.217 16.84C57.097 18.4133 57.537 20.2 57.537 22.2ZM53.777 21.44C53.777 20.0533 53.4704 18.8667 52.857 17.88C52.2437 16.8667 51.4037 16.1067 50.337 15.6C49.297 15.0667 48.137 14.8 46.857 14.8C45.017 14.8 43.4437 15.3867 42.137 16.56C40.857 17.7333 40.1237 19.36 39.937 21.44H53.777ZM58.9817 23C58.9817 20.7333 59.4351 18.76 60.3417 17.08C61.2484 15.3733 62.5017 14.0533 64.1017 13.12C65.7284 12.1867 67.5817 11.72 69.6617 11.72C72.3551 11.72 74.5684 12.3733 76.3017 13.68C78.0617 14.9867 79.2217 16.8 79.7817 19.12H75.8617C75.4884 17.7867 74.7551 16.7333 73.6617 15.96C72.5951 15.1867 71.2617 14.8 69.6617 14.8C67.5817 14.8 65.9017 15.52 64.6217 16.96C63.3417 18.3733 62.7017 20.3867 62.7017 23C62.7017 25.64 63.3417 27.68 64.6217 29.12C65.9017 30.56 67.5817 31.28 69.6617 31.28C71.2617 31.28 72.5951 30.9067 73.6617 30.16C74.7284 29.4133 75.4617 28.3467 75.8617 26.96H79.7817C79.1951 29.2 78.0217 31 76.2617 32.36C74.5017 33.6933 72.3017 34.36 69.6617 34.36C67.5817 34.36 65.7284 33.8933 64.1017 32.96C62.5017 32.0267 61.2484 30.7067 60.3417 29C59.4351 27.2933 58.9817 25.2933 58.9817 23ZM92.1986 34.36C90.1453 34.36 88.2786 33.8933 86.5986 32.96C84.9453 32.0267 83.6386 30.7067 82.6786 29C81.7453 27.2667 81.2786 25.2667 81.2786 23C81.2786 20.76 81.7586 18.7867 82.7186 17.08C83.7053 15.3467 85.0386 14.0267 86.7186 13.12C88.3986 12.1867 90.2786 11.72 92.3586 11.72C94.4386 11.72 96.3186 12.1867 97.9986 13.12C99.6786 14.0267 100.999 15.3333 101.959 17.04C102.945 18.7467 103.439 20.7333 103.439 23C103.439 25.2667 102.932 27.2667 101.919 29C100.932 30.7067 99.5853 32.0267 97.8786 32.96C96.1719 33.8933 94.2786 34.36 92.1986 34.36ZM92.1986 31.16C93.5053 31.16 94.7319 30.8533 95.8786 30.24C97.0253 29.6267 97.9453 28.7067 98.6386 27.48C99.3586 26.2533 99.7186 24.76 99.7186 23C99.7186 21.24 99.3719 19.7467 98.6786 18.52C97.9853 17.2933 97.0786 16.3867 95.9586 15.8C94.8386 15.1867 93.6253 14.88 92.3186 14.88C90.9853 14.88 89.7586 15.1867 88.6386 15.8C87.5453 16.3867 86.6653 17.2933 85.9986 18.52C85.3319 19.7467 84.9986 21.24 84.9986 23C84.9986 24.7867 85.3186 26.2933 85.9586 27.52C86.6253 28.7467 87.5053 29.6667 88.5986 30.28C89.6919 30.8667 90.8919 31.16 92.1986 31.16ZM107.385 34.24C106.691 34.24 106.105 34 105.625 33.52C105.145 33.04 104.905 32.4533 104.905 31.76C104.905 31.0667 105.145 30.48 105.625 30C106.105 29.52 106.691 29.28 107.385 29.28C108.051 29.28 108.611 29.52 109.065 30C109.545 30.48 109.785 31.0667 109.785 31.76C109.785 32.4533 109.545 33.04 109.065 33.52C108.611 34 108.051 34.24 107.385 34.24Z"
                fill="currentColor"
              />
            </svg>
          </a>
          </div>
          <div className="col-span-2 flex items-center md:col-span-3">
            <div className="flex flex-col gap-y-3">
              {socials.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  target="_blank"
                  className="flex items-center gap-x-2 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                  style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
                >
                  {item.icon}
                  <span className="text-sm/6">{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Widget Columns */}
        {widgetMenus.map((widget) => (
          <div key={widget.id} className="text-sm">
            <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200" style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}>
              {widget.title}
            </h2>
            <ul className="mt-5 space-y-4">
              {widget.menus.map((item, index) => (
                <li key={index}>
                  <a
                    key={index}
                    className="text-neutral-6000 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
                    href={item.href}
                    style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
