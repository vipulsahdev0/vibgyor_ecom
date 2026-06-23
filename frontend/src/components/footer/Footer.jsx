import { Link } from "react-router-dom";
import { Sparkles, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";

const FOOTER_LINKS = {
  Shop: [
    { label: "All Products", to: "/products" },
    { label: "Categories", to: "/categories" },
    { label: "New Arrivals", to: "/products" },
    { label: "Deals", to: "/products" },
  ],
  Account: [
    { label: "My Profile", to: "/account/profile" },
    { label: "My Orders", to: "/account/orders" },
    { label: "Wishlist", to: "/account/wishlist" },
    { label: "Cart", to: "/account/cart" },
  ],
  Support: [
    { label: "Help Center", to: "/" },
    { label: "Returns Policy", to: "/" },
    { label: "Shipping Info", to: "/" },
    { label: "Contact Us", to: "/" },
  ],
};

const SOCIALS = [
  { icon: <FaGithub size={15} />, label: "GitHub", href: "#" },
  { icon: <FaTwitter size={15} />, label: "Twitter", href: "#" },
  { icon: <FaInstagram size={15} />, label: "Instagram", href: "#" },
];

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-3 text-slate-900"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-lg font-black tracking-tight">Vibgyor</span>
            </Link>

            <p className="max-w-sm text-sm leading-7 text-slate-500">
              Your smart shopping destination for curated products across every
              category. Clean browsing, trusted delivery, and better discovery
              in one place.
            </p>

            <ul className="mt-5 space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                New Delhi, India
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <a
                  href="mailto:support@vibgyor.com"
                  className="transition-colors hover:text-indigo-600"
                >
                  support@vibgyor.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                +91 98765 43210
              </li>
            </ul>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {heading}
              </h3>
              <ul className="space-y-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="group inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-900"
                    >
                      <span>{label}</span>
                      <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 py-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Vibgyor E-Commerce. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            {SOCIALS.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-indigo-200 hover:text-indigo-600"
              >
                {icon}
              </a>
            ))}
          </div>

          <div className="flex gap-4 text-xs text-slate-400">
            <Link to="/privacy" className="transition-colors hover:text-slate-700">
              Privacy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-slate-700">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}