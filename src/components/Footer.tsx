import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">About</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about-us" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/our-mission" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link to="/leadership" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                  Leadership
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Center */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Help Center</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faqs" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/user-guides" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                  User Guides
                </Link>
              </li>
              <li>
                <Link to="/contact-support" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 text-sm">
                Kigali, Rwanda
              </li>
              <li className="text-gray-600 text-sm">
                support@rwandaislamichub.rw
              </li>
              <li className="text-gray-600 text-sm">
                +250 7XX XXX XXX
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-600">
            <p>© {currentYear} Rwanda Islamic Hub. All rights reserved.</p>
            <p className="text-gray-500">Official Government Partner</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
