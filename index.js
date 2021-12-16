import fs from 'node:fs';
import csv from 'csv/lib/sync.js';
import jsonToTable from 'json-to-table';
import { table } from 'table';
import {
  aggregateAllChannels as aggregateAllChannelsTransform,
  cleanse as cleanseTransform,
  deduplicate as deduplicateTransform,
  filterToCreatedAfter2010 as filterToCreatedAfter2010Transform,
  filterToFirstNameStartingWithB as filterToFirstNameStartingWithBTransform,
  getInterestedRepeatCustomers as getInterestedRepeatCustomersTransform,
  getTotalValueOfAllCustomers as getTotalValueOfAllCustomersTransform,
  getUsersWithNonMatchingEmails as getUsersWithNonMatchingEmailsTransform,
  sortByFirstName as sortByFirstNameTransform,
  sortBySubscriptionDate as sortBySubscriptionDateTransform,
} from './transformations.js';

function parseCsv(inFile) {
  const fileContent = fs.readFileSync('dataIn/' + inFile, 'utf8');
  return csv.parse(fileContent, { columns: true });
}

const inFiles = {
  hubspot: parseCsv('hubspot-export.csv'),
  mailchimp: parseCsv('mailchimp-export.csv'),
  stripe: parseCsv('stripe-export.csv'),
};

export function sortBySubscriptionDate() {
  return {
    outFile: 'mailchimp-sorted-subscription-date.csv',
    data: sortBySubscriptionDateTransform(inFiles.mailchimp),
  };
}

export function sortByFirstName() {
  return {
    outFile: 'mailchimp-sorted-first-name.csv',
    data: sortByFirstNameTransform(inFiles.mailchimp),
  };
}

export function filterToFirstNameStartingWithB() {
  return {
    outFile: 'hubspot-first-name-b.csv',
    data: filterToFirstNameStartingWithBTransform(inFiles.hubspot),
  };
}

export function filterToCreatedAfter2010() {
  return {
    outFile: 'stripe-created-after-2010.csv',
    data: filterToCreatedAfter2010Transform(inFiles.stripe),
  };
}

export function aggregateAllChannels() {
  return {
    outFile: 'all-channels-aggregate.csv',
    data: aggregateAllChannelsTransform(
      inFiles.hubspot,
      inFiles.mailchimp,
      inFiles.stripe,
    ),
  };
}

export function deduplicate() {
  return {
    outFile: 'stripe-deduplicated.csv',
    data: deduplicateTransform(inFiles.stripe),
  };
}

export function cleanse() {
  return {
    outFile: 'hubspot-cleansed.csv',
    data: cleanseTransform(inFiles.hubspot),
  };
}

export function getInterestedRepeatCustomers() {
  return {
    outFile: 'all-channels-interested-repeat-customers.csv',
    data: getInterestedRepeatCustomersTransform(
      inFiles.hubspot,
      inFiles.stripe,
    ),
  };
}

export function getTotalValueOfAllCustomers() {
  return {
    outFile: 'hubspot-total-value-all-customers.csv',
    data: getTotalValueOfAllCustomersTransform(inFiles.hubspot),
  };
}

export function getUsersWithNonMatchingEmails() {
  return {
    outFile: 'all-channels-users-non-matching-emails.csv',
    data: getUsersWithNonMatchingEmailsTransform(
      inFiles.mailchimp,
      inFiles.stripe,
    ),
  };
}

const commandFn = {
  sortByFirstName,
  sortBySubscriptionDate,
  filterToFirstNameStartingWithB,
  filterToCreatedAfter2010,
  aggregateAllChannels,
  deduplicate,
  cleanse,
  getInterestedRepeatCustomers,
  getTotalValueOfAllCustomers,
  getUsersWithNonMatchingEmails,
}[process.argv[2]];

if (commandFn) {
  const { outFile, data } = commandFn();
  const outFilePath = 'dataOut/' + outFile;
  fs.writeFileSync(outFilePath, csv.stringify(data, { header: true }));
  console.log(`Wrote file ${outFilePath} successfully with following data:`);
  console.log(table(jsonToTable(data)));
}
