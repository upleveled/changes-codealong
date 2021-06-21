import { parse } from 'date-fns';

function parseStripeDateFormat(dateString) {
  return parse(dateString, 'dd/MM/yyyy HH:mm:ss', new Date());
}

// Codealong: Data Sorting and Filtering in Node.js
export function sortBySubscriptionDate(input) {
  return input.sort(
    (a, b) => new Date(a.subscribeDate) - new Date(b.subscribeDate),
  );
}

export function sortByFirstName(input) {
  return input.sort((a, b) => {
    if (a.firstName < b.firstName) {
      return -1;
    }
    if (a.firstName > b.firstName) {
      return 1;
    }
    return 0;
  });
}

export function filterToFirstNameStartingWithB(input) {
  return input.filter((user) => user['First Name'].startsWith('B'));
}

export function filterToCreatedAfter2010(input) {
  return input.filter((user) => {
    const date = parseStripeDateFormat(user.created_at_date);
    return date >= new Date('2010-01-01');
  });
}

// Codealong: Data Aggregation, Deduplication and Cleansing in Node.js
export function aggregateAllChannels(
  inputHubspot,
  inputMailchimp,
  inputStripe,
) {
  return inputHubspot.map((hubspotUser) => {
    // Identify by first name and last name because
    // sometimes the email address doesn't match
    const firstName = hubspotUser['First Name'].split(' ')[0];
    const lastName = hubspotUser['Last Name'];
    const mailchimpUser = inputMailchimp.find(
      (user) => user.firstName === firstName && user.lastName === lastName,
    );
    const stripeTransaction = inputStripe.find((transaction) => {
      const fName = transaction.name.split(' ')[0];
      const lName = transaction.name.split(' ').pop();
      return fName === firstName && lName === lastName;
    });

    return {
      hubspotContactId: hubspotUser['Contact Id'],
      firstName,
      lastName,
      hubspotLeadStatus: hubspotUser['Lead Status'],
      hubspotRegisteredAt: hubspotUser['Registered At'],
      hubspotTotalValue: hubspotUser['Total Value'],
      mailchimpEmail: mailchimpUser.emailAddress,
      mailchimpStatus: mailchimpUser.status,
      mailchimpAudienceName: mailchimpUser.audienceName,
      mailchimpSubscribeDate: mailchimpUser.subscribeDate,
      stripeId: stripeTransaction?.id,
      stripeEmail: stripeTransaction?.email,
      stripeCreatedAt: stripeTransaction?.created_at_date,
    };
  });
}

export function deduplicate(input) {
  return input.reduce((users, user) => {
    const existingUser = users.find((u) => {
      return (
        u.id === user.id &&
        u.name === user.name &&
        u.email === user.email &&
        u.created_at_date === user.created_at_date
      );
    });
    if (!existingUser) users.push(user);
    return users;
  }, []);
}

export function cleanse(input) {
  return input.map((user) => {
    user['Lead Status'] = user['Lead Status']
      .replaceAll('Interrrrrested', 'Interested')
      .replaceAll('Customerr', 'Customer');

    user['Registered At'] = user['Registered At'].replace(/s.+$/, '');

    return user;
  });
}

// Codealong: Data Analysis in Node.js
export function getInterestedRepeatCustomers(inputHubspot, inputStripe) {
  inputHubspot = cleanse(inputHubspot);
  inputStripe = deduplicate(inputStripe);

  return inputHubspot.filter((hubspotUser) => {
    const stripeTransactions = inputStripe.filter((transaction) => {
      const fName = transaction.name.split(' ')[0];
      const lName = transaction.name.split(' ').pop();
      return (
        fName === hubspotUser['First Name'] &&
        lName === hubspotUser['Last Name']
      );
    });
    return (
      ['Open Offer', 'Current Customer'].includes(hubspotUser['Lead Status']) &&
      stripeTransactions.length > 1
    );
  });
}

export function getTotalValueOfAllCustomers(input) {
  return [
    {
      total: input.reduce((total, user) => {
        return total + parseInt(user['Total Value']);
      }, 0),
    },
  ];
}

export function getUsersWithNonMatchingEmails(inputMailchimp, inputStripe) {
  inputStripe = deduplicate(inputStripe);

  return inputMailchimp
    .map((user) => {
      const stripeTransaction = inputStripe.find((transaction) => {
        const fName = transaction.name.split(' ')[0];
        const lName = transaction.name.split(' ').pop();
        return fName === user.firstName && lName === user.lastName;
      });

      return {
        mailchimpEmail: user.emailAddress,
        mailchimpStatus: user.status,
        mailchimpAudienceName: user.audienceName,
        mailchimpSubscribeDate: user.subscribeDate,
        stripeId: stripeTransaction?.id,
        stripeEmail: stripeTransaction?.email,
        stripeCreatedAt: stripeTransaction?.created_at_date,
      };
    })
    .filter(
      (user) => user.stripeEmail && user.mailchimpEmail !== user.stripeEmail,
    );
}
