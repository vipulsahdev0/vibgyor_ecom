import { Link } from "react-router-dom";
import { Sparkles, Mail, MapPin, Phone } from "lucide-react";
import { FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa'

const FOOTER_LINKS = {
  Shop: [
    { label: "All Products",  to: "/products"    },
    { label: "Categories",    to: "/categories"  },
    { label: "New Arrivals",  to: "/products"    },
    { label: "Deals",         to: "/products"    },
  ],
  Account: [
    { label: "My Profile",    to: "/account/profile"  },
    { label: "My Orders",     to: "/account/orders"   },
    { label: "Wishlist",      to: "/account/wishlist" },
    { label: "Cart",          to: "/account/cart"     },
  ],
  Support: [
    { label: "Help Center",   to: "/" },
    { label: "Returns Policy",to: "/" },
    { label: "Shipping Info", to: "/" },
    { label: "Contact Us",    to: "/" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Main grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:grid-cols-5">

          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="mb-4 flex items-center gap-2 font-black tracking-tight text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <span className="text-lg text-indigo-600">Vibgyor</span>
            </Link>

            <p className="mb-5 max-w-xs text-sm leading-relaxed text-slate-500">
              Your smart shopping destination for curated products across every category.
              Quality, speed, and simplicity — all in one place.
            </p>

            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                New Delhi, India
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <a href="mailto:support@vibgyor.com" className="hover:text-indigo-600 transition-colors">
                  support@vibgyor.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                +91 98765 43210
              </li>
            </ul>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="inline-block text-sm text-slate-500 transition-all hover:translate-x-0.5 hover:text-slate-900"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 py-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Vibgyor Commerce. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {[
              { icon: <FaGithub size={15} />,    label: "GitHub",    href: "#" },
              { icon: <FaTwitter size={15} />,   label: "Twitter",   href: "#" },
              { icon: <FaInstagram size={15} />, label: "Instagram", href: "#" },
            ].map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-indigo-300 hover:text-indigo-600"
              >
                {icon}
              </a>
            ))}
          </div>

          <div className="flex gap-4 text-xs text-slate-400">
            <Link to="/privacy" className="transition-colors hover:text-slate-700">Privacy</Link>
            <Link to="/terms"   className="transition-colors hover:text-slate-700">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}