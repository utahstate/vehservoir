import React from "react";
import AdminNavigation from "components/AdminNavigation";
import type { NextPage, NextPageContext } from "next/types";

type Props = {
  user: any;
};

const Dashboard: NextPage<Props> = (props) => {
  return (
    <>
      <AdminNavigation />
      <div className="container">
        <h1>Dashboard </h1>
        <p>Welcome to the Vehservoir admin dashboard.</p>
      </div>
    </>
  );
};

type PageContext = NextPageContext & {
  query: Props;
};

Dashboard.getInitialProps = async (context: PageContext): Promise<Props> => {
  return {
    user: context.query,
  };
};

export default Dashboard;
