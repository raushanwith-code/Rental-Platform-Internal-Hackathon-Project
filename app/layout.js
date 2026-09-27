import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "RentIt — Equipment Rental & Booking Platform",
  description: "Browse, book, and manage equipment rentals with zero double-bookings.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        <footer className="text-center text-xs text-slate-400 py-8">
          RentIt · Rental & Equipment Booking Platform · Conflict-free scheduling, guaranteed.
        </footer>
      </body>
    </html>
  );
}
