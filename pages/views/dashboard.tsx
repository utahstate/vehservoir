import React from "react";

const Dashboard = () => {
  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      fetch("/admin/logout", {
        method: "post",
      })
        .then((res) => {
          if (res.ok) {
            location.replace("/admin/login");
          }
        })
        .catch((err) => console.log(err));

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p>Welcome to the Vehservoir admin dashboard.</p>
      <button className="btn btn-ghost" onClick={handleSubmit}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
