import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PromoBanner from "../components/search/PromoBanner";
import { submitContactMessage } from "../services/contactApi";
import { selectUser } from "../redux/slices/authSlice";

/* ──────────────────────────────────────────────
   Social Brand Icons – 24×24 circle with embedded SVG
   matching the Ciseco reference exactly
   ────────────────────────────────────────────── */
function FacebookIcon() {
  return (
    <a href="#" aria-label="Facebook" className="block">
      <svg className="h-6 w-6" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="#1877F2" />
        <path
          d="M29.634 25.5l.734-4.782h-4.592V17.87c0-1.308.641-2.583 2.695-2.583h2.086V11.23s-1.892-.323-3.7-.323c-3.777 0-6.245 2.289-6.245 6.432v3.644h-4.199V25.5h4.2v11.553a16.69 16.69 0 005.166 0V25.5h3.855z"
          fill="#fff"
        />
      </svg>
    </a>
  );
}

function TwitterIcon() {
  return (
    <a href="#" aria-label="Twitter" className="block">
      <svg className="h-6 w-6" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="#1DA1F2" />
        <path
          d="M36.653 16.344a10.3 10.3 0 01-2.958.811 5.16 5.16 0 002.264-2.852 10.32 10.32 0 01-3.27 1.25 5.155 5.155 0 00-8.78 4.698A14.63 14.63 0 0113.277 14.9a5.154 5.154 0 001.596 6.88 5.12 5.12 0 01-2.335-.645v.065a5.155 5.155 0 004.133 5.052 5.169 5.169 0 01-2.327.088 5.157 5.157 0 004.813 3.578 10.335 10.335 0 01-6.398 2.205c-.416 0-.825-.024-1.228-.072a14.59 14.59 0 007.903 2.316c9.483 0 14.67-7.854 14.67-14.66 0-.224-.005-.446-.014-.666a10.47 10.47 0 002.563-2.697z"
          fill="#fff"
        />
      </svg>
    </a>
  );
}

function YoutubeIcon() {
  return (
    <a href="#" aria-label="Youtube" className="block">
      <svg className="h-6 w-6" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="#FF0000" />
        <path
          d="M35.054 18.868a3.017 3.017 0 00-2.122-2.136C31.06 16.227 24 16.227 24 16.227s-7.06 0-8.932.505a3.018 3.018 0 00-2.122 2.136C12.44 20.739 12.44 24.68 12.44 24.68s0 3.941.506 5.812a3.017 3.017 0 002.122 2.136c1.872.505 8.932.505 8.932.505s7.06 0 8.932-.505a3.017 3.017 0 002.122-2.136c.506-1.871.506-5.812.506-5.812s0-3.941-.506-5.812zM21.545 28.247v-7.135l5.974 3.568-5.974 3.567z"
          fill="#fff"
        />
      </svg>
    </a>
  );
}

function TelegramIcon() {
  return (
    <a href="#" aria-label="Telegram" className="block">
      <svg className="h-6 w-6" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="#0088cc" />
        <path
          d="M33.95 15.19c-.22 2.37-1.2 8.13-1.7 10.79-.21 1.12-.62 1.5-1.02 1.54-.87.08-1.53-.57-2.37-1.12-1.32-.87-2.07-1.41-3.35-2.26-1.48-.98-.52-1.51.33-2.38.22-.23 4.07-3.73 4.14-4.04.01-.04.02-.19-.07-.27s-.22-.05-.31-.03c-.13.03-2.24 1.42-6.33 4.18-.6.41-1.14.61-1.62.6-.53-.02-1.56-.3-2.32-.55-.94-.3-1.68-.46-1.62-.99.03-.27.41-.54 1.11-.82 4.38-1.91 7.3-3.17 8.75-3.77 4.17-1.73 5.03-2.04 5.6-2.04.12 0 .4.03.58.18.15.12.19.29.21.41-.02.09.02.36 0 .57z"
          fill="#fff"
        />
      </svg>
    </a>
  );
}

const infoBlocks = [
  {
    icon: "🗺",
    label: "ADDRESS",
    value: "Photo booth tattooed prism, portland taiyaki hoodie neutra typewriter",
  },
  {
    icon: "💌",
    label: "EMAIL",
    value: "nc.example@example.com",
  },
  {
    icon: "☎",
    label: "PHONE",
    value: "000-123-456-7890",
  },
];

export default function Contact() {
  const currentUser = useSelector(selectUser);

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.fullName || "",
        email: prev.email || currentUser.email || "",
      }));
    }
  }, [currentUser]);

  const validateLocally = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required.";
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.message.trim()) errors.message = "Message is required.";
    return errors;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = validateLocally();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });
      toast.success("Your message has been sent successfully.");
      setFormData({
        fullName: currentUser?.fullName || "",
        email: currentUser?.email || "",
        message: "",
      });
    } catch (err) {
      if (err.status === 429) {
        toast.error(err.message || "Too many requests. Please try again later.");
      } else if (err.fieldErrors && Array.isArray(err.fieldErrors)) {
        const mapped = {};
        err.fieldErrors.forEach((fe) => {
          if (fe.field) mapped[fe.field] = fe.message;
        });
        setFieldErrors(mapped);
        toast.error(err.message || "Please fix the errors below.");
      } else {
        toast.error(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200 min-h-screen flex flex-col"
      style={{ fontFamily: "Poppins, 'Poppins Fallback', sans-serif" }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="pt-12 pb-16 sm:py-16 lg:py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-y-16 px-4 sm:px-6 lg:px-8 lg:gap-y-28">
            <div className="grid shrink-0 grid-cols-1 gap-12 md:grid-cols-2">
              {/* Left Column — Contact Information */}
              <div>
                <h1 className="text-4xl font-semibold text-neutral-900 dark:text-neutral-100 sm:text-5xl">
                  Contact
                </h1>

                <div className="mt-14 flex flex-col space-y-9">
                  {infoBlocks.map((block) => (
                    <div key={block.label}>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
                        <span className="mr-1.5">{block.icon}</span>
                        {block.label}
                      </h3>
                      <span className="mt-2.5 block text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                        {block.value}
                      </span>
                    </div>
                  ))}

                  {/* Socials */}
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
                      <span className="mr-1.5">🌏</span>
                      SOCIALS
                    </h3>
                    <div className="mt-3 flex items-center gap-2.5">
                      <FacebookIcon />
                      <TwitterIcon />
                      <YoutubeIcon />
                      <TelegramIcon />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column — Contact Form */}
              <div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6" noValidate>
                  {/* Full Name */}
                  <label className="block">
                    <span className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Full name
                    </span>
                    <input
                      type="text"
                      placeholder="Example Doe"
                      value={formData.fullName}
                      onChange={handleChange("fullName")}
                      disabled={submitting}
                      className="mt-1 block h-11 w-full rounded-full border border-neutral-950/10 bg-transparent px-4 py-3 text-sm font-normal text-neutral-900 placeholder-neutral-500 outline-hidden hover:border-neutral-950/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-neutral-400 dark:hover:border-white/20 dark:focus:border-blue-400 dark:focus:ring-blue-400 disabled:opacity-50"
                    />
                    {fieldErrors.fullName && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</p>
                    )}
                  </label>

                  {/* Email Address */}
                  <label className="block">
                    <span className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Email address
                    </span>
                    <input
                      type="email"
                      placeholder="example@example.com"
                      value={formData.email}
                      onChange={handleChange("email")}
                      disabled={submitting}
                      className="mt-1 block h-11 w-full rounded-full border border-neutral-950/10 bg-transparent px-4 py-3 text-sm font-normal text-neutral-900 placeholder-neutral-500 outline-hidden hover:border-neutral-950/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-neutral-400 dark:hover:border-white/20 dark:focus:border-blue-400 dark:focus:ring-blue-400 disabled:opacity-50"
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                    )}
                  </label>

                  {/* Message */}
                  <label className="block">
                    <span className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Message
                    </span>
                    <textarea
                      rows={6}
                      value={formData.message}
                      onChange={handleChange("message")}
                      disabled={submitting}
                      className="mt-1 block w-full rounded-2xl border border-neutral-950/10 bg-transparent px-4 py-3 text-sm font-normal text-neutral-900 placeholder-neutral-500 outline-hidden hover:border-neutral-950/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-neutral-400 dark:hover:border-white/20 dark:focus:border-blue-400 dark:focus:ring-blue-400 resize-y disabled:opacity-50"
                    />
                    {fieldErrors.message && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.message}</p>
                    )}
                  </label>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-neutral-900 px-7 text-sm font-medium text-white hover:bg-neutral-800 transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <hr role="presentation" className="w-full border-t border-neutral-950/10 dark:border-white/10" />
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="pb-16 lg:pb-24">
          <PromoBanner />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
