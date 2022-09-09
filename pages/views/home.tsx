import * as React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { HomeProps } from 'dto/Home';

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: { name: context.query.name }
  }
};

const Home : NextPage<HomeProps> = ({ name }) => {
  return <a>{name}</a>;
}

export default Home;