import { expect, test } from '@jest/globals';
import {
  aggregateAllChannels,
  cleanse,
  deduplicate,
  filterToCreatedAfter2010,
  filterToFirstNameStartingWithB,
  getInterestedRepeatCustomers,
  getTotalValueOfAllCustomers,
  getUsersWithNonMatchingEmails,
  sortByFirstName,
  sortBySubscriptionDate,
} from '../index';

test('sorts by first name', () => {
  expect(sortByFirstName()).toMatchSnapshot();
});

test('sorts by subscription date', () => {
  expect(sortBySubscriptionDate()).toMatchSnapshot();
});

test('filters to first name starting with B', () => {
  expect(filterToFirstNameStartingWithB()).toMatchSnapshot();
});

test('filters to created after 2010', () => {
  expect(filterToCreatedAfter2010()).toMatchSnapshot();
});

test('aggregates data across all channels', () => {
  expect(aggregateAllChannels()).toMatchSnapshot();
});

test('deduplicates users', () => {
  expect(deduplicate()).toMatchSnapshot();
});

test('cleanses user data', () => {
  expect(cleanse()).toMatchSnapshot();
});

test('gets interested, repeat customers', () => {
  expect(getInterestedRepeatCustomers()).toMatchSnapshot();
});

test('gets total value of all customers', () => {
  expect(getTotalValueOfAllCustomers()).toMatchSnapshot();
});

test('gets users with non-matching emails', () => {
  expect(getUsersWithNonMatchingEmails()).toMatchSnapshot();
});
