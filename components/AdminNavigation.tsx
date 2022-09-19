import Link from "next/link";
import React from "react";

const navItems = [
  {
    name: "Vehicles",
    route: "/admin/vehicles",
  },
  {
    name: "Reservations",
    route: "/admin/reservations",
  },
  {
    name: "Admins",
    route: "/admin/admin-table",
  },
];

const AdminNavigation: React.FC = (): JSX.Element => {
  const handleLogout = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    fetch("/admin/logout", {
      method: "post",
    })
      .then((res) => {
        if (res.ok) {
          location.replace("/admin/login");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <section>
      <div className="container">
        <div className="terminal-nav">
          <div className="terminal-logo">
            <div className="logo terminal-prompt">
              <a className="no-style" href="/admin/dashboard">
                Vehservoir
              </a>
            </div>
          </div>
          <nav className="terminal-menu">
            <ul>
              {navItems.map(({ name, route }) => (
                <li className="menu-item" key={name}>
                  <Link href={route}>{name}</Link>
                </li>
              ))}
              <li>
                <a className="btn btn-primary" onClick={handleLogout}>
                  Logout
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default AdminNavigation;
